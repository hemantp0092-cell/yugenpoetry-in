import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell, adminHead } from "@/components/admin/AdminShell";
import { formatDate } from "@/lib/data";

export const Route = createFileRoute("/admin/messages")({
  head: adminHead("Letters"),
  ssr: false,
  component: Messages,
});

function Messages() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => (await supabase.from("messages").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  return (
    <AdminShell title="Letters">
      {!data?.length && <p className="text-muted-foreground">No letters yet.</p>}
      <div className="space-y-4">
        {data?.map((m) => (
          <div key={m.id} className="border border-border p-6">
            <div className="flex justify-between text-sm"><a href={`mailto:${m.email}`} className="text-gold">{m.name} · {m.email}</a><span className="text-muted-foreground">{formatDate(m.created_at)}</span></div>
            <p className="mt-4 whitespace-pre-line font-poem">{m.message}</p>
            <button onClick={async () => { await supabase.from("messages").delete().eq("id", m.id); qc.invalidateQueries(); }} className="eyebrow mt-4 hover:text-destructive">Delete</button>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
