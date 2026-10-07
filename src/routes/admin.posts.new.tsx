import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, adminHead } from "@/components/admin/AdminShell";
import { PostEditor } from "@/components/admin/PostEditor";

export const Route = createFileRoute("/admin/posts/new")({
  head: adminHead("Write"),
  ssr: false,
  component: () => <AdminShell title="A new page"><PostEditor /></AdminShell>,
});
