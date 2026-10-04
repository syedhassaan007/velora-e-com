import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = { title: "Velora — considered technology", description: "Audio, wearables and workspace gear, chosen with restraint." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body className="font-sans">
        <Nav />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 py-10 text-sm text-bone/50">© Velora. Demo store — sandbox payments only.</footer>
      </body>
    </html>
  );
}
