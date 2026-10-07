import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell, adminHead } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { settingsQuery, uploadMedia, type Settings } from "@/lib/data";

export const Route = createFileRoute("/admin/settings")({
  head: adminHead("Settings"),
  ssr: false,
  component: SettingsPage,
});

function SettingsPage() {
  const { data } = useQuery(settingsQuery);
  return <AdminShell title="Website settings">{data && <Form s={data} />}</AdminShell>;
}

function Form({ s }: { s: Settings }) {
  const qc = useQueryClient();
  const [f, setF] = useState({ hero_tagline: s.hero_tagline, intro: s.intro, about: s.about, hero_image_url: s.hero_image_url ?? "", contact_email: s.contact_email ?? "" });
  const save = async () => {
    const { error } = await supabase.from("site_settings").update({ ...f, hero_image_url: f.hero_image_url || null, contact_email: f.contact_email || null }).eq("id", 1);
    if (error) return toast.error(error.message);
    qc.invalidateQueries(); toast("Saved");
  };
  return (
    <div className="space-y-6 max-w-2xl">
      <label className="block"><span className="eyebrow">Hero tagline</span><Textarea rows={3} value={f.hero_tagline} onChange={(e) => setF({ ...f, hero_tagline: e.target.value })} className="rounded-none poem-text text-lg" /></label>
      <label className="block"><span className="eyebrow">Introduction</span><Textarea rows={3} value={f.intro} onChange={(e) => setF({ ...f, intro: e.target.value })} className="rounded-none" /></label>
      <label className="block"><span className="eyebrow">About Vandana</span><Textarea rows={8} value={f.about} onChange={(e) => setF({ ...f, about: e.target.value })} className="rounded-none" /></label>
      <label className="block"><span className="eyebrow">Contact email (optional)</span><Input value={f.contact_email} onChange={(e) => setF({ ...f, contact_email: e.target.value })} className="rounded-none" /></label>
      <label className="block"><span className="eyebrow">Hero image</span><Input type="file" accept="image/*" className="rounded-none" onChange={async (e) => {
        const file = e.target.files?.[0]; if (!file) return;
        try { setF({ ...f, hero_image_url: await uploadMedia(file) }); } catch { toast.error("Upload failed"); }
      }} /></label>
      {f.hero_image_url && <img src={f.hero_image_url} alt="" className="w-full max-h-64 object-cover" />}
      <Button variant="ink" size="lg" onClick={save}>Save settings</Button>
    </div>
  );
}
