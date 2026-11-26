import "../globals.css";
import { fontClasses } from "../fonts";

export const metadata = { title: "Component showcase (private)", robots: { index: false, follow: false } };

// A private page for choosing pack components. Not linked from the site and not indexed.
export default function ShowcaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontClasses.en}>
      <body className="bg-marble text-ink">{children}</body>
    </html>
  );
}
