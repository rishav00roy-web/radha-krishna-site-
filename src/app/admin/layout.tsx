import type { Metadata } from "next";
import "../globals.css";
import { fontClasses } from "../fonts";

export const metadata: Metadata = { title: "Admin | Prem Mandir", robots: { index: false, follow: false } };

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontClasses.en}>
      <body className="bg-marble-2">{children}</body>
    </html>
  );
}
