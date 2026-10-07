import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell, adminHead } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/dashboard")({
  head: adminHead("Dashboard"),
  ssr: false,
  component: Dashboard,
});

function Dashboard() {
  const { data: posts } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: async () => (await supabase.from("posts").select("*").order("updated_at", { ascending: false })).data ?? [],
  });
  const { data: msgCount } = useQuery({
    queryKey: ["admin-msg-count"],
    queryFn: async () => (await supabase.from("messages").select("id", { count: "exact", head: true })).count ?? 0,
  });
  const pub = posts?.filter((p) => p.status === "published") ?? [];
  const stats = [
    ["Published", pub.length],
    ["Drafts", posts?.filter((p) => p.status === "draft").length ?? 0],
    ["Total views", pub.reduce((a, p) => a + p.views, 0)],
    ["Total likes", pub.reduce((a, p) => a + p.likes, 0)],
    ["Letters", msgCount ?? 0],
  ] as const;
  const top = [...pub].sort((a, b) => b.views - a.views).slice(0, 5);
  return (
    <AdminShell title="Good evening, Vandana">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-border border border-border">
        {stats.map(([l, v]) => (
          <div key={l} className="bg-background p-6"><p className="eyebrow">{l}</p><p className="font-display text-4xl mt-2 text-gold">{v}</p></div>
        ))}
      </div>
      <Link to="/admin/posts/new" className="inline-block mt-10 border border-gold/50 px-6 py-3 eyebrow !text-ivory hover:bg-gold hover:!text-primary-foreground">+ Write a new shayari</Link>
      <h2 className="font-display text-2xl mt-14 mb-4 text-ivory">Most read</h2>
      <ul className="divide-y divide-border border-y border-border">
        {top.map((p) => (
          <li key={p.id} className="flex justify-between py-3 text-sm">
            <Link to="/admin/posts/$id/edit" params={{ id: p.id }} className="hover:text-gold font-poem">{p.title}</Link>
            <span className="text-muted-foreground">{p.views} views · {p.likes} likes</span>
          </li>
        ))}
      </ul>
    </AdminShell>
  );
}
