import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import GlobalControls from "@/components/GlobalControls";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BICR Attribution Dashboard",
  description:
    "Marketing attribution dashboard for Big Island Coffee Roasters",
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
      <body className="min-h-full flex bg-[#f8f9fa]">
        {/* Sidebar navigation */}
        <Navigation />

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
          {/* Persistent global controls bar */}
          <GlobalControls />

          {/* Page content */}
          <main className="flex-1 p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
