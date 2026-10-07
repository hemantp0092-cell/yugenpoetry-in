import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

const NAV = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/posts", label: "Shayari" },
  { to: "/admin/posts/new", label: "Write new" },
  { to: "/admin/collections", label: "Collections" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/messages", label: "Letters" },
  { to: "/admin/settings", label: "Settings" },
] as const;

export function useIsOwner() {
  const [state, setState] = useState<"loading" | "owner" | "denied">("loading");
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return alive && setState("denied");
      const { data: ok } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
      if (alive) setState(ok ? "owner" : "denied");
    })();
    return () => { alive = false; };
  }, []);
  return state;
}

export function AdminShell({ title, children }: { title: string; children: ReactNode }) {
  const state = useIsOwner();
  const navigate = useNavigate();
  const qc = useQueryClient();
  useEffect(() => { if (state === "denied") navigate({ to: "/admin", replace: true }); }, [state, navigate]);
  if (state !== "owner") return <div className="min-h-screen grid place-items-center eyebrow">Opening the diary…</div>;

  const signOut = async () => {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/admin", replace: true });
  };

  return (
    <div className="min-h-screen md:flex">
      <aside className="md:w-60 md:min-h-screen border-b md:border-b-0 md:border-r border-border bg-sidebar p-6 flex md:flex-col gap-4 overflow-x-auto">
        <Link to="/" className="font-display text-xl tracking-[0.4em] text-ivory shrink-0">VANDANA</Link>
        <p className="eyebrow hidden md:block mb-4">Private study</p>
        {NAV.map((n) => (
          <Link key={n.to} to={n.to} activeOptions={{ exact: true }} className="text-sm text-muted-foreground hover:text-gold shrink-0" activeProps={{ className: "!text-gold" }}>{n.label}</Link>
        ))}
        <button onClick={signOut} className="md:mt-auto text-sm text-muted-foreground hover:text-destructive text-left shrink-0">Sign out</button>
      </aside>
      <main className="flex-1 p-6 md:p-12 max-w-5xl">
        <h1 className="font-display text-4xl text-ivory mb-10">{title}</h1>
        {children}
      </main>
    </div>
  );
}

export const adminHead = (t: string) => () => ({
  meta: [
    { title: `${t} — Vandana's Study` },
    { name: "description", content: "Private writing room." },
    { property: "og:title", content: `${t} — Vandana's Study` },
    { property: "og:description", content: "Private writing room." },
    { name: "robots", content: "noindex" },
  ],
});
