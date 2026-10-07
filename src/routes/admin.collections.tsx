import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell, adminHead } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { collectionsQuery, slugify, uploadMedia } from "@/lib/data";

export const Route = createFileRoute("/admin/collections")({
  head: adminHead("Collections"),
  ssr: false,
  component: Collections,
});

function Collections() {
  const qc = useQueryClient();
  const { data } = useQuery(collectionsQuery);
  const add = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const title = String(fd.get("title")).trim();
    if (!title) return;
    const { error } = await supabase.from("collections").insert({ title, slug: slugify(title), description: String(fd.get("description")) || null, sort_order: (data?.length ?? 0) + 1 });
    if (error) return toast.error(error.message);
    form.reset(); qc.invalidateQueries();
  };
  const update = async (id: string, patch: { title?: string; description?: string; cover_url?: string }) => {
    const { error } = await supabase.from("collections").update(patch).eq("id", id);
    if (error) toast.error(error.message); else qc.invalidateQueries();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this collection? Its shayari remain.")) return;
    await supabase.from("collections").delete().eq("id", id); qc.invalidateQueries();
  };
  return (
    <AdminShell title="Collections">
      <form onSubmit={add} className="flex flex-wrap gap-3 mb-10">
        <Input name="title" placeholder="Title" className="rounded-none max-w-56" />
        <Input name="description" placeholder="Description" className="rounded-none flex-1 min-w-48" />
        <Button variant="ink" type="submit">Add</Button>
      </form>
      <div className="space-y-4">
        {data?.map((c) => (
          <div key={c.id} className="border border-border p-5 grid md:grid-cols-[120px_1fr_auto] gap-4 items-start">
            {c.cover_url ? <img src={c.cover_url} alt="" className="w-full aspect-square object-cover" /> : <div className="aspect-square bg-muted" />}
            <div className="space-y-2">
              <Input defaultValue={c.title} onBlur={(e) => e.target.value !== c.title && update(c.id, { title: e.target.value })} className="rounded-none font-display text-xl" />
              <Input defaultValue={c.description ?? ""} onBlur={(e) => update(c.id, { description: e.target.value })} className="rounded-none" />
              <Input type="file" accept="image/*" className="rounded-none" onChange={async (e) => {
                const file = e.target.files?.[0]; if (!file) return;
                try { update(c.id, { cover_url: await uploadMedia(file) }); } catch { toast.error("Upload failed"); }
              }} />
            </div>
            <button onClick={() => remove(c.id)} className="eyebrow hover:text-destructive">Delete</button>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
