import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell, adminHead } from "@/components/admin/AdminShell";
import { PostEditor } from "@/components/admin/PostEditor";

export const Route = createFileRoute("/admin/posts/$id/edit")({
  head: adminHead("Edit"),
  ssr: false,
  component: EditPost,
});

function EditPost() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-post", id],
    queryFn: async () => (await supabase.from("posts").select("*").eq("id", id).maybeSingle()).data,
  });
  return (
    <AdminShell title="Edit shayari">
      {isLoading ? null : data ? <PostEditor post={data} /> : <p className="text-muted-foreground">Not found.</p>}
    </AdminShell>
  );
}
