import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ScaleTrack",
  description: "Track and visualize your weight journey",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className}`}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            {/* Header with navigation */}
            <Header />

            {/* Main content */}
            <main className="flex-grow container mx-auto px-4 py-6">
              {children}
            </main>

            {/* Footer */}
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
