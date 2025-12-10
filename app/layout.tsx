import type { Metadata, Viewport } from "next";
import "./globals.css";
import PWARegister from "@/components/PWARegister";
import SessionProvider from "@/components/SessionProvider";
import AutoSyncManager from "@/components/AutoSyncManager";
import AutoBackupManager from "@/components/AutoBackupManager";

export const metadata: Metadata = {
  title: "TimeFlow Tracker",
  description: "Tracking de atividades com fluxo contínuo",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TimeFlow",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased bg-gray-50">
        <SessionProvider>
          <PWARegister />
          <AutoSyncManager />
          <AutoBackupManager />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
