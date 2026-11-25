import Link from "next/link";
import { Icon } from "@/components/Icon";

// Rendered inside the locale layout; English copy because params are not available here.
export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] items-center">
      <div className="container-x max-w-xl text-center">
        <Icon name="lotus" size={64} className="mx-auto text-gold" />
        <h1 className="display-lg mt-6">Page not found</h1>
        <p className="mt-4 text-ink-soft">The page you are looking for does not exist or has moved.</p>
        <Link href="/en" className="btn btn-primary mt-8">Return home</Link>
      </div>
    </section>
  );
}
