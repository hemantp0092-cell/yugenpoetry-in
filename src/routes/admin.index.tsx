import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminHead } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/")({
  head: adminHead("Enter"),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [ownerExists, setOwnerExists] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.rpc("owner_exists").then(({ data }) => setOwnerExists(!!data));
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: ok } = await supabase.rpc("claim_owner");
      if (ok) navigate({ to: "/admin/dashboard" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email")), password = String(f.get("password"));
    setBusy(true);
    try {
      if (ownerExists === false) {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } });
        if (error) throw error;
        if (!data.session) { toast("Check your email to confirm, then return here to sign in."); return; }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      const { data: ok } = await supabase.rpc("claim_owner");
      if (!ok) { await supabase.auth.signOut(); throw new Error("This study belongs to Vandana alone."); }
      navigate({ to: "/admin/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not sign in");
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen grid place-items-center px-6">
      <form onSubmit={submit} className="w-full max-w-sm text-center space-y-5 animate-reveal">
        <p className="eyebrow">Private study</p>
        <h1 className="font-display text-5xl tracking-[0.3em] text-ivory">VANDANA</h1>
        <p className="text-sm text-muted-foreground">{ownerExists === false ? "First visit — create the one and only owner account." : "Sign in to write."}</p>
        <Input name="email" type="email" required placeholder="Email" className="rounded-none h-12" />
        <Input name="password" type="password" required minLength={8} placeholder="Password" className="rounded-none h-12" />
        <Button type="submit" variant="ink" size="lg" className="w-full" disabled={busy || ownerExists === null}>
          {ownerExists === false ? "Create owner account" : "Enter"}
        </Button>
      </form>
    </div>
  );
}
