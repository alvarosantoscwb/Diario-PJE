import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeScript } from "@/components/theme-script";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Diário PJE",
  description: "Gestão de comunicações processuais",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`h-full antialiased ${geist.variable} font-sans`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <ThemeScript />
        {children}
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  );
}
