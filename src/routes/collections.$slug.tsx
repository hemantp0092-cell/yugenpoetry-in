import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout, PageHeading } from "@/components/site/SiteLayout";
import { PoemCard, EmptyNote } from "@/components/site/PoemCard";
import { collectionsQuery, postsQuery } from "@/lib/data";

export const Route = createFileRoute("/collections/$slug")({
  head: () => ({
    meta: [
      { title: "Collection — Vandana" },
      { name: "description", content: "A collection of shayari by Vandana." },
      { property: "og:title", content: "Collection — Vandana" },
      { property: "og:description", content: "A collection of shayari by Vandana." },
    ],
  }),
  component: CollectionPage,
});

function CollectionPage() {
  const { slug } = Route.useParams();
  const { data: cols } = useQuery(collectionsQuery);
  const col = cols?.find((c) => c.slug === slug);
  const { data: posts } = useQuery({ ...postsQuery({ collection: col?.id }), enabled: !!col });
  if (cols && !col) return <SiteLayout><EmptyNote text="Collection not found." /></SiteLayout>;
  return (
    <SiteLayout>
      <PageHeading eyebrow="Collection" title={col?.title ?? ""} sub={col?.description ?? undefined} />
      <div className="mx-auto max-w-6xl px-6 grid gap-px md:grid-cols-2 lg:grid-cols-3">
        {posts?.map((p) => <PoemCard key={p.id} post={p} />)}
      </div>
      {posts && !posts.length && <EmptyNote text="Pages are still being written…" />}
    </SiteLayout>
  );
}
