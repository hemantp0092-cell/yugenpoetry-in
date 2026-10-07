import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell, adminHead } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categoriesQuery, slugify } from "@/lib/data";

export const Route = createFileRoute("/admin/categories")({
  head: adminHead("Categories"),
  ssr: false,
  component: Categories,
});

function Categories() {
  const qc = useQueryClient();
  const { data } = useQuery(categoriesQuery);
  const add = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name")).trim();
    if (!name) return;
    const { error } = await supabase.from("categories").insert({ name, slug: slugify(name), description: String(fd.get("description")) || null });
    if (error) return toast.error(error.message);
    form.reset(); qc.invalidateQueries();
  };
  const rename = async (id: string, name: string) => {
    const { error } = await supabase.from("categories").update({ name }).eq("id", id);
    if (error) toast.error(error.message); else qc.invalidateQueries();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this category? Shayari stay, just uncategorised.")) return;
    await supabase.from("categories").delete().eq("id", id); qc.invalidateQueries();
  };
  return (
    <AdminShell title="Categories">
      <form onSubmit={add} className="flex flex-wrap gap-3 mb-10">
        <Input name="name" placeholder="Name" className="rounded-none max-w-48" />
        <Input name="description" placeholder="Description" className="rounded-none flex-1 min-w-48" />
        <Button variant="ink" type="submit">Add</Button>
      </form>
      <ul className="divide-y divide-border border-y border-border">
        {data?.map((c) => (
          <li key={c.id} className="flex items-center gap-4 py-3">
            <Input defaultValue={c.name} onBlur={(e) => e.target.value !== c.name && rename(c.id, e.target.value)} className="rounded-none border-0 max-w-64" />
            <span className="flex-1 text-sm text-muted-foreground">{c.description}</span>
            <button onClick={() => remove(c.id)} className="eyebrow hover:text-destructive">Delete</button>
          </li>
        ))}
      </ul>
    </AdminShell>
  );
}
