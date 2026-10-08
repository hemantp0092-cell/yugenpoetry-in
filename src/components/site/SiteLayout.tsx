import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Instagram, Menu, Search, X } from "lucide-react";
import { DEFAULT_INSTAGRAM_URL, instagramHandle, settingsQuery } from "@/lib/data";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/shayari", label: "Shayari" },
  { to: "/collections", label: "Collections" },
  { to: "/media", label: "Media" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function useInstagram() {
  const { data } = useQuery(settingsQuery);
  const url = data?.instagram_url?.trim() || DEFAULT_INSTAGRAM_URL;
  return { url, handle: instagramHandle(url) };
}

export function SiteLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const ig = useInstagram();
  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[80] bg-background px-3 py-2">Skip to content</a>
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/60 border-b border-border">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-xl tracking-[0.45em] text-ivory">VANDANA</Link>
          <nav className="hidden md:flex items-center gap-7" aria-label="Main">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }} className="eyebrow hover:text-gold transition-colors" activeProps={{ className: "!text-gold" }}>
                {n.label}
              </Link>
            ))}
            <Link to="/search" aria-label="Search" className="text-muted-foreground hover:text-gold"><Search className="size-4" /></Link>
          </nav>
          <button className="md:hidden text-ivory" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
        {open && (
          <nav className="md:hidden border-t border-border bg-background px-6 py-8 flex flex-col gap-6" aria-label="Mobile">
            {[...NAV, { to: "/search", label: "Search" } as const].map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="font-display text-2xl text-ivory">{n.label}</Link>
            ))}
          </nav>
        )}
      </header>
      <main id="main" className="flex-1 pt-16">{children}</main>
      <footer className="border-t border-border mt-24">
        <div className="mx-auto max-w-6xl px-6 py-14 grid gap-8 md:grid-cols-3 items-center">
          <div>
            <p className="font-display text-2xl tracking-[0.4em] text-ivory">VANDANA</p>
            <p className="mt-2 text-sm text-muted-foreground font-poem">लफ़्ज़ों का एक घर</p>
          </div>
          <div className="flex flex-wrap gap-6 md:justify-center">
            {NAV.slice(1).map((n) => <Link key={n.to} to={n.to} className="eyebrow hover:text-gold">{n.label}</Link>)}
          </div>
          <a href={ig.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 md:justify-end text-muted-foreground hover:text-gold text-sm">
            <Instagram className="size-4" /> {ig.handle}
          </a>
        </div>
        <p className="text-center eyebrow pb-8">
          © {new Date().getFullYear()} Vandana · All words are her own · <Link to="/privacy" className="hover:text-gold">Privacy</Link>
        </p>
      </footer>
    </div>
  );
}

export function PageHeading({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string | undefined }) {
  return (
    <div className="mx-auto max-w-3xl px-6 pt-20 pb-12 text-center animate-reveal">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="font-display text-5xl md:text-6xl mt-4 text-ivory">{title}</h1>
      {sub && <p className="mt-5 text-muted-foreground">{sub}</p>}
      <div className="hairline mt-10 mx-auto w-40" />
    </div>
  );
}
