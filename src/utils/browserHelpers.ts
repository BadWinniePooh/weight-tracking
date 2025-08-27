// Storage utilities for local storage management
export function setItem(key: string, value: any): boolean {
  try {
    if (typeof window === 'undefined') return false;
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function getItem<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window === 'undefined') return defaultValue;
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function removeItem(key: string): boolean {
  try {
    if (typeof window === 'undefined') return false;
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function clearStorage(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    localStorage.clear();
    return true;
  } catch {
    return false;
  }
}

export function getStorageSize(): number {
  try {
    if (typeof window === 'undefined') return 0;
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  } catch {
    return 0;
  }
}

export function isStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

// URL utilities
export function getQueryParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  
  const params: Record<string, string> = {};
  const searchParams = new URLSearchParams(window.location.search);
  
  for (const [key, value] of searchParams) {
    params[key] = value;
  }
  
  return params;
}

export function buildUrl(base: string, params: Record<string, string>): string {
  const url = new URL(base, window.location.origin);
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  
  return url.toString();
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Device detection utilities
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768;
}

export function isTablet(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth > 768 && window.innerWidth <= 1024;
}

export function isDesktop(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth > 1024;
}

export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (isMobile()) return 'mobile';
  if (isTablet()) return 'tablet';
  return 'desktop';
}

// Color utilities
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export function isDarkColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  
  // Calculate relative luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance < 0.5;
}