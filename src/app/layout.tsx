import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KKN Sisdamas Desa Sukahaji",
  description: "Platform Digital KKN Sisdamas Desa Sukahaji (Kelompok 55, 56, 57)",
  openGraph: {
    title: "KKN Sisdamas Desa Sukahaji",
    description: "Platform Digital KKN Sisdamas Desa Sukahaji (Kelompok 55, 56, 57)",
    images: ["/logo-uin.png"],
  },
  icons: {
    icon: "/logo-uin.png",
    shortcut: "/logo-uin.png",
    apple: "/logo-uin.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
