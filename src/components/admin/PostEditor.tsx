import { useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { MOODS, categoriesQuery, collectionsQuery, slugify, uploadMedia, type Post } from "@/lib/data";

const sel = "h-10 w-full bg-transparent border border-input px-3 text-sm";

export function PostEditor({ post }: { post?: Post }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: cats } = useQuery(categoriesQuery);
  const { data: cols } = useQuery(collectionsQuery);
  const [f, setF] = useState({
    title: post?.title ?? "", body: post?.body ?? "", mood: post?.mood ?? "",
    category_id: post?.category_id ?? "", collection_id: post?.collection_id ?? "",
    featured: post?.featured ?? false, cover_url: post?.cover_url ?? "",
    media_type: post?.media_type ?? "", media_url: post?.media_url ?? "",
    tags: (post?.tags ?? []).join(", "),
  });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f, v: string | boolean) => setF((s) => ({ ...s, [k]: v }));

  const upload = async (file: File | undefined, kind: "cover" | "media") => {
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadMedia(file);
      if (kind === "cover") set("cover_url", url);
      else { set("media_url", url); set("media_type", file.type.startsWith("audio") ? "audio" : file.type.startsWith("video") ? "video" : "image"); }
      toast("Uploaded");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Upload failed"); }
    setBusy(false);
  };

  const save = async (status: "draft" | "published" | "archived") => {
    if (!f.title.trim() || !f.body.trim()) return toast.error("A title and the shayari itself are needed.");
    setBusy(true);
    const row = {
      title: f.title.trim(), body: f.body, mood: f.mood || null,
      category_id: f.category_id || null, collection_id: f.collection_id || null,
      featured: f.featured, cover_url: f.cover_url || null,
      media_type: f.media_type || null, media_url: f.media_url || null,
      tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean),
      excerpt: f.body.split("\n")[0]?.slice(0, 140) ?? null,
      status,
      published_at: status === "published" ? post?.published_at ?? new Date().toISOString() : post?.published_at ?? null,
    };
    const res = post
      ? await supabase.from("posts").update(row).eq("id", post.id)
      : await supabase.from("posts").insert({ ...row, slug: slugify(f.title) });
    setBusy(false);
    if (res.error) return toast.error(res.error.message);
    qc.invalidateQueries();
    toast(status === "published" ? "Published" : status === "draft" ? "Draft saved" : "Archived");
    navigate({ to: "/admin/posts" });
  };

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-10">
      <div className="space-y-6">
        <Input value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="Title" className="rounded-none h-14 font-display text-3xl border-0 border-b" />
        <Textarea value={f.body} onChange={(e) => set("body", e.target.value)} placeholder={"लिखिए…\nEvery line break is kept exactly."} rows={16} className="rounded-none poem-text text-xl" />
        <div>
          <p className="eyebrow mb-2">Preview</p>
          <div className="border border-border p-8 text-center"><p className="font-display text-3xl text-gold">{f.title}</p><p className="poem-text text-xl mt-6">{f.body}</p></div>
        </div>
      </div>
      <div className="space-y-5 text-sm">
        <div className="flex flex-col gap-2">
          <Button variant="ink" disabled={busy} onClick={() => save("published")}>Publish</Button>
          <Button variant="outline" className="rounded-none" disabled={busy} onClick={() => save("draft")}>Save draft</Button>
          {post && <Button variant="quiet" disabled={busy} onClick={() => save("archived")}>Archive</Button>}
        </div>
        <label className="flex items-center justify-between"><span className="eyebrow">Featured</span><Switch checked={f.featured} onCheckedChange={(v) => set("featured", v)} /></label>
        <label className="block"><span className="eyebrow">Mood</span>
          <select value={f.mood} onChange={(e) => set("mood", e.target.value)} className={sel}><option value="">—</option>{MOODS.map((m) => <option key={m}>{m}</option>)}</select></label>
        <label className="block"><span className="eyebrow">Category</span>
          <select value={f.category_id} onChange={(e) => set("category_id", e.target.value)} className={sel}><option value="">—</option>{cats?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label className="block"><span className="eyebrow">Collection</span>
          <select value={f.collection_id} onChange={(e) => set("collection_id", e.target.value)} className={sel}><option value="">—</option>{cols?.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select></label>
        <label className="block"><span className="eyebrow">Tags (comma separated)</span><Input value={f.tags} onChange={(e) => set("tags", e.target.value)} className="rounded-none" /></label>
        <label className="block"><span className="eyebrow">Cover image</span><Input type="file" accept="image/*" onChange={(e) => upload(e.target.files?.[0], "cover")} className="rounded-none" /></label>
        {f.cover_url && <img src={f.cover_url} alt="" className="w-full" />}
        <label className="block"><span className="eyebrow">Audio / video recitation</span><Input type="file" accept="audio/*,video/*" onChange={(e) => upload(e.target.files?.[0], "media")} className="rounded-none" /></label>
        {f.media_url && <p className="text-xs text-muted-foreground">{f.media_type} attached · <button className="underline" onClick={() => { set("media_url", ""); set("media_type", ""); }}>remove</button></p>}
      </div>
    </div>
  );
}
