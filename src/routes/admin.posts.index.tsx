import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell, adminHead } from "@/components/admin/AdminShell";
import { formatDate } from "@/lib/data";

export const Route = createFileRoute("/admin/posts/")({
  head: adminHead("Shayari"),
  ssr: false,
  component: Posts,
});

function Posts() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | "published" | "draft" | "archived">("all");
  const { data } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: async () => (await supabase.from("posts").select("*").order("updated_at", { ascending: false })).data ?? [],
  });
  const rows = (data ?? []).filter((p) => filter === "all" || p.status === filter);
  const remove = async (id: string) => {
    if (!confirm("Delete this shayari forever? Archiving keeps it hidden instead.")) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries();
  };
  return (
    <AdminShell title="Shayari">
      <div className="flex gap-4 mb-6">
        {(["all", "published", "draft", "archived"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`eyebrow ${filter === f ? "!text-gold" : ""}`}>{f}</button>
        ))}
      </div>
      <ul className="divide-y divide-border border-y border-border">
        {rows.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center gap-4 py-4">
            <div className="flex-1 min-w-48">
              <Link to="/admin/posts/$id/edit" params={{ id: p.id }} className="font-poem text-lg text-ivory hover:text-gold">{p.title}</Link>
              <p className="text-xs text-muted-foreground mt-1">{p.status}{p.featured ? " · featured" : ""} · {formatDate(p.updated_at)}</p>
            </div>
            <Link to="/admin/posts/$id/edit" params={{ id: p.id }} className="eyebrow hover:text-gold">Edit</Link>
            <button onClick={() => remove(p.id)} className="eyebrow hover:text-destructive">Delete</button>
          </li>
        ))}
      </ul>
    </AdminShell>
  );
}
