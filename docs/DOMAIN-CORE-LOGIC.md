# ScaleTrack – Domänen-Kernlogik Dokumentation

> **Projekt:** ScaleTrack (weight-tracking) v0.3.1
> **Stand:** 13. Februar 2026
> **Tech-Stack:** Next.js 16 · React 19 · Prisma 7 (SQLite) · NextAuth 4 · Chart.js · TypeScript

---

## 1. Projektübersicht

**ScaleTrack** ist eine Self-Hosted Web-Applikation zur persönlichen Gewichtsverfolgung und -visualisierung. Benutzer können tägliche Gewichtsmessungen erfassen, historische Daten aus Excel importieren und ihren Fortschritt anhand berechneter Referenzlinien (Floor, Ceiling, Ideal, Trend) in einem Diagramm verfolgen.

### Kernfeatures

| Feature | Beschreibung |
|---------|-------------|
| **Gewichtseingabe** | Manuelle Erfassung einzelner Messwerte mit optionalen Notizen |
| **Datentabelle** | Tabellarische Übersicht aller Einträge mit Einzel- und Massenlöschung |
| **Diagramm-Visualisierung** | Liniendiagramm mit Tagesdurchschnitten, Trendlinie und berechneten Floor/Ceiling/Ideal-Linien |
| **Excel-Import** | Massenimport historischer Daten aus `.xlsx`/`.xls`-Dateien |
| **Benutzereinstellungen** | Individuelle Zielwerte und Berechnungsparameter |
| **Benutzerverwaltung** | Registrierung, Login, Passwort-Reset per E-Mail |
| **HD-Chart-Export** | Export des Diagramms als hochauflösendes PNG (3840×2160) |
| **Dark Mode** | Theme-Umschaltung mit persistenter Präferenz |

---

## 2. Datenmodell (Prisma Schema)

```
┌──────────────────────┐
│        User          │
├──────────────────────┤
│ id          (UUID)   │──┐
│ username    (unique)  │  │
│ email       (unique)  │  │
│ passwordHash          │  │    ┌───────────────────────┐
│ resetToken?           │  │    │     UserEntry          │
│ resetTokenExpiry?     │  ├───▶│─────────────────────── │
│ createdAt             │  │    │ id        (UUID)       │
│ updatedAt             │  │    │ value     (Float)      │
└──────────────────────┘  │    │ date      (DateTime)   │
                           │    │ notes?    (String)     │
                           │    │ userId    → User.id    │
                           │    └───────────────────────┘
                           │
                           │    ┌───────────────────────┐
                           │    │    UserSettings        │
                           └───▶│───────────────────────│
                                │ id           (UUID)    │
                                │ weightGoal?  (Float)   │
                                │ lossRate?    (Float)   │
                                │ carbFatRatio?(Float)   │
                                │ bufferValue? (Float)   │
                                │ userId (unique)→User.id│
                                └───────────────────────┘
```

### Beziehungen
- **User → UserEntry**: 1:n (Cascade Delete) — Ein User besitzt beliebig viele Gewichtseinträge
- **User → UserSettings**: 1:1 (Cascade Delete) — Ein User hat genau eine Settings-Instanz

### Datenbank
- **Engine:** SQLite via `better-sqlite3`
- **Adapter:** `@prisma/adapter-better-sqlite3`
- **Entwicklungsmodus:** Singleton-Pattern für den PrismaClient (global caching)

---

## 3. Domänen-Kernlogik

### 3.1 Gewichtseinträge (UserEntry)

Die zentrale Domänenentität. Jeder Eintrag besteht aus:

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| `value` | Float | Der Gewichtsmesswert (Einheit benutzerdefiniert) |
| `date` | DateTime | Zeitstempel der Messung |
| `notes` | String? | Optionale Notiz (z.B. "Morning", "After workout") |

**Geschäftsregeln:**
- `value` muss ein gültiger numerischer Wert sein (serverseitige Validierung via `parseFloat`)
- Einträge sind **immer an einen User gebunden** (`userId` Pflichtfeld)
- Beim Lesen werden nur Einträge des authentifizierten Users zurückgegeben (**Data Isolation**)
- Löschen: Einzel-Löschung prüft zusätzlich Besitzverhältnis (`userId`-Check)

### 3.2 Benutzereinstellungen (UserSettings)

Konfigurationsparameter für die Chart-Berechnungen:

| Parameter | Default | Beschreibung |
|-----------|---------|-------------|
| `weightGoal` | – (Pflicht für Berechnungen) | Das Zielgewicht des Benutzers |
| `lossRate` | `0.0055` | Gewichtsverlust-Rate pro Tag (relative Rate) |
| `carbFatRatio` | `0.6` | Verhältnis Kohlenhydrate/Fett (beeinflusst Ceiling-Berechnung) |
| `bufferValue` | `0.0075` | Pufferwert für Floor/Ceiling-Initialisierung |

**Geschäftsregeln:**
- Settings werden per **Upsert** gespeichert (erstellt bei erstem Speichern, aktualisiert danach)
- Default-Werte greifen, wenn Settings `null` sind oder noch nicht existieren

### 3.3 Diagramm-Berechnungslogik ⭐

Dies ist die **komplexeste Domänenlogik** des Projekts. Sie berechnet fünf Datenserien:

#### 3.3.1 Tagesdurchschnitte (Daily Averages)
```
Für jeden Tag: Durchschnitt = Summe(alle Messwerte des Tages) / Anzahl(Messwerte)
```
- Mehrere Messungen pro Tag (z.B. Morgen, Mittag, Abend) werden zu einem Tagesmittelwert aggregiert
- Auf 2 Dezimalstellen gerundet

#### 3.3.2 Trendlinie (Linear Regression)
Lineare Regression über alle Datenpunkte:
```
slope = Σ((xi - x̄)(yi - ȳ)) / Σ((xi - x̄)²)
intercept = ȳ - slope × x̄
trendY(i) = slope × xi + intercept
```
- x-Werte: Tage seit dem ersten Eintrag
- y-Werte: Gewichtsmesswerte (oder Tagesdurchschnitte)

#### 3.3.3 Floor-Linie (Untergrenze)
Berechnung der unteren Gewichtsgrenze:
```
Startwert = Durchschnitt der ersten 6 Tage
Floor(Tag 7) = Startwert - (Startwert × bufferValue × 0.5)
Floor(Tag n) = Floor(n-1) - (Floor(n-1) - weightGoal) × lossRate
```
- **Die ersten 6 Tage sind leer** (Kalibrierungsphase)
- Die Floor-Linie konvergiert asymptotisch gegen das `weightGoal`
- Die `lossRate` steuert die Konvergenzgeschwindigkeit

#### 3.3.4 Ceiling-Linie (Obergrenze)
Berechnung der oberen Gewichtsgrenze:
```
Startwert = Durchschnitt der ersten 6 Tage
Ceiling(Tag 7) = Startwert + (Startwert × bufferValue × 0.5)
adjustedGoal = weightGoal + (weightGoal × bufferValue)
Ceiling(Tag n) = Ceiling(n-1) - (Ceiling(n-1) - adjustedGoal) × lossRate × carbFatRatio
```
- Analog zur Floor-Linie, aber mit **Aufschlag** statt Abzug
- Das Zielgewicht wird um den `bufferValue` nach oben adjustiert
- Die `carbFatRatio` verlangsamt die Ceiling-Konvergenz relativ zur Floor-Linie

#### 3.3.5 Ideal-Linie
```
Ideal(Tag n) = (Floor(Tag n) + Ceiling(Tag n)) / 2
```
- Einfacher Mittelwert zwischen Floor und Ceiling
- Repräsentiert den "optimalen" Verlauf

#### Zusammenspiel der Linien
```
  Gewicht
    │
    │   ╲ Ceiling (rot)
    │    ╲
    │     ╲  - - Ideal (grau, gestrichelt)
    │      ╲
    │       ╲ Floor (grün)
    │        ╲
    │         ╲─────── weightGoal
    │
    └──────────────────── Zeit
        ↑
    6 Tage Kalibrierung
```

**Wichtig:** Die Referenzlinien werden **immer auf Basis ALLER Daten** berechnet, auch wenn im UI ein Datumsbereich gefiltert wird. Nur die Anzeige wird beschnitten.

---

## 4. Authentifizierung & Autorisierung

### 4.1 Auth-System
- **Provider:** NextAuth v4 mit `CredentialsProvider`
- **Strategie:** JWT-basiert (keine Datenbank-Sessions)
- **Session-Dauer:** 30 Tage
- **Passwort-Hashing:** bcryptjs (Salt Rounds: 10)

### 4.2 Registrierung
1. Validierung: Username, E-Mail und Passwort erforderlich
2. Duplikat-Prüfung: Username UND E-Mail müssen eindeutig sein
3. Passwort wird mit bcrypt gehasht
4. User wird in der Datenbank erstellt

### 4.3 Login
1. User-Lookup per Username
2. Passwortvergleich via `bcryptjs.compare()`
3. Bei Erfolg: JWT-Token mit `id`, `username`, `email`

### 4.4 Passwort-Reset-Flow
```
[User] → POST /api/auth/forgot-password (email)
                │
                ▼
        Token generieren (crypto.randomBytes, 32 Bytes hex)
        Token-Ablauf: 1 Stunde
        Token in DB speichern
                │
                ▼
        Reset-E-Mail senden (nodemailer)
                │
                ▼
[User] → POST /api/auth/reset-password (token, newPassword)
                │
                ▼
        Token validieren (existiert + nicht abgelaufen)
        Neues Passwort hashen
        Token aus DB entfernen
```

**Sicherheitshinweis:** Die Forgot-Password-Antwort verrät nicht, ob die E-Mail existiert.

### 4.5 Autorisierung
- Jeder API-Endpunkt (außer Auth-Routen) prüft `getServerSession(authOptions)`
- Unauthentifizierte Anfragen erhalten `401 Unauthorized`
- Daten-Endpunkte filtern zusätzlich nach `userId` (Row-Level Security)

---

## 5. Excel-Import Logik

### Unterstütztes Format
```
| date       | measurement 1 | measurement 2 | measurement 3 |
|------------|---------------|---------------|---------------|
| 2025-01-15 | 85.2          | 84.8          | 85.0          |
| 15.01.2025 | 84.5          |               | 84.3          |
```

### Spalten-Mapping (case-insensitive)
- `date` / `Date` → Datum
- `measurement1` / `measurement 1` / `Measurement 1` → Messung 1
- `measurement2` / `measurement 2` / `Measurement 2` → Messung 2
- `measurement3` / `measurement 3` / `Measurement 3` → Messung 3

### Datums-Parsing (Fallback-Kette)
1. `yyyy-MM-dd` (ISO)
2. `MM/dd/yyyy` (US-Format)
3. `dd.MM.yyyy` (EU-Format)
4. Manuelles Parsing für `dd.MM.yyyy`
5. Excel Serial Date Number (Tage seit 30.12.1899)

### Zeitstempel-Zuweisung
| Messung | Uhrzeit (konfigurierte Timezone) |
|---------|----------------------------------|
| Measurement 1 | 08:00 (Morgen) |
| Measurement 2 | 12:00 (Mittag) |
| Measurement 3 | 20:00 (Abend) |

- Timezone konfigurierbar via `TIMEZONE` Environment-Variable (Default: UTC)
- Zeiten werden in UTC konvertiert und gespeichert

### Import-Verhalten
- Leere Messwerte werden übersprungen
- Fehler pro Zeile werden gesammelt und zurückgegeben
- Valide Einträge werden per `createMany` batch-inseriert
- **Kein Duplikat-Check** — Import erstellt immer neue Einträge

---

## 6. API-Endpunkte Übersicht

| Methode | Route | Beschreibung | Auth |
|---------|-------|-------------|------|
| POST | `/api/auth/register` | Benutzerregistrierung | ✗ |
| POST | `/api/auth/[...nextauth]` | Login/Logout (NextAuth) | ✗ |
| POST | `/api/auth/forgot-password` | Passwort-Reset anfordern | ✗ |
| POST | `/api/auth/reset-password` | Passwort zurücksetzen | ✗ |
| GET | `/api/entries` | Alle Einträge des Users laden | ✓ |
| POST | `/api/entries` | Neuen Eintrag erstellen | ✓ |
| DELETE | `/api/entries/[id]` | Einzelnen Eintrag löschen | ✓ |
| DELETE | `/api/entries/delete-all` | Alle Einträge löschen | ✓ |
| POST | `/api/import` | Excel-Daten importieren | ✓ |
| GET | `/api/settings` | Benutzereinstellungen laden | ✓ |
| POST | `/api/settings` | Benutzereinstellungen speichern | ✓ |

---

## 7. Frontend-Architektur

### Seitenstruktur
```
/ (Home)              → Gewichtseingabe-Formular
/login                → Anmeldeseite
/register             → Registrierungsseite
/forgot-password      → Passwort vergessen
/reset-password       → Passwort zurücksetzen (mit Token)
/table                → Datentabelle mit Löschfunktionen
/chart                → Diagramm-Visualisierung
/settings             → Benutzereinstellungen + Datenmanagement
/import               → Excel-Import
/design-system        → Design-System Referenz (nur Development)
```

### Navigationsfluss
- **Nicht authentifiziert:** Nur Login, Register, Forgot/Reset Password zugänglich
- **Authentifiziert:** Navigation zeigt Input, Table, Chart
- **Design-System:** Nur im Development-Modus sichtbar (Middleware blockiert in Production)

### Komponentenstruktur
```
components/
├── layout/
│   ├── Header.tsx        → App-Header mit Navigation
│   └── Footer.tsx        → App-Footer
├── ui/
│   ├── Alert.tsx         → Statusmeldungen (success, error, info, warning)
│   ├── Button.tsx        → Button mit Varianten und Loading-State
│   ├── Card.tsx          → Container-Komponente
│   └── FormInput.tsx     → Formular-Eingabefeld mit Label und Beschreibung
├── main-nav.tsx          → Hauptnavigation
├── user-nav.tsx          → User-Menü (Logout, Settings)
├── theme-toggle.tsx      → Dark/Light Mode Umschalter
├── ThemeSync.tsx         → Theme-Synchronisation
└── providers.tsx         → SessionProvider + ThemeProvider Wrapper
```

---

## 8. Infrastruktur & Deployment

### Containerisierung
- **Dockerfile** vorhanden (Multi-Stage Build vermutet)
- **compose.yaml** für Docker Compose Orchestrierung
- **docker-entrypoint.sh** als Container-Startskript

### Environment-Variablen
| Variable | Beschreibung |
|----------|-------------|
| `DATABASE_URL` | SQLite-Datenbankpfad (z.B. `file:./dev.db`) |
| `NEXTAUTH_SECRET` | JWT-Signing-Secret |
| `NEXTAUTH_URL` | Basis-URL der Anwendung |
| `TIMEZONE` | Timezone für Import-Zeitstempel (Default: UTC) |
| `EMAIL_SERVER_HOST` | SMTP-Host für Passwort-Reset-E-Mails |
| `EMAIL_SERVER_PORT` | SMTP-Port |
| `EMAIL_SERVER_USER` | SMTP-Benutzername |
| `EMAIL_SERVER_PASSWORD` | SMTP-Passwort |
| `EMAIL_SERVER_SECURE` | SMTP TLS (`true`/`false`) |
| `EMAIL_FROM` | Absenderadresse für E-Mails |

### Theming
- Custom `ThemeManager` Singleton-Pattern für Dark/Light Mode
- CSS-Variablen-basiertes Design-Token-System
- `useThemeColor`-Hook für dynamische Theme-Farben in Komponenten

---

## 9. Bekannte Limitierungen & Architekturentscheidungen

1. **Keine Validierungsbibliothek aktiv:** `valibot` ist als Dependency vorhanden, wird aber in den API-Routen noch nicht genutzt — Validierung erfolgt manuell
2. **Kein Duplikat-Check beim Import:** Mehrfacher Import derselben Datei erzeugt doppelte Einträge
3. **Keine Pagination:** Entries werden komplett geladen (könnte bei großen Datenmengen zum Problem werden)
4. **Chart-Berechnungen clientseitig:** Floor/Ceiling/Trend werden im Browser berechnet, nicht auf dem Server
5. **SQLite als Datenbank:** Single-User/Low-Concurrency optimiert — bei Multi-User-Betrieb ggf. Migration auf PostgreSQL nötig
6. **Kalibrierungsphase:** Die ersten 6 Tage haben keine Floor/Ceiling/Ideal-Linien (Minimum 7 Tage Daten nötig)
7. **Keine Unit-Tests:** Aktuell keine Test-Infrastruktur vorhanden
