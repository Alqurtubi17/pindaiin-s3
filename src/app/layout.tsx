import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Pindaiin",
    template: "%s | Pindaiin",
  },
  description: "Aplikasi edukasi, misi, dan aktivitas QRIS untuk UMKM di Jawa Timur.",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0284c7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen antialiased bg-slate-50 text-slate-900 selection:bg-sky-200">
        {children}
      </body>
    </html>
  );
}

