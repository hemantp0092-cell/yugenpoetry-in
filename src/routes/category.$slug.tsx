import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout, PageHeading } from "@/components/site/SiteLayout";
import { PoemCard, EmptyNote } from "@/components/site/PoemCard";
import { categoriesQuery, postsQuery } from "@/lib/data";

export const Route = createFileRoute("/category/$slug")({
  head: () => ({
    meta: [
      { title: "Category — Vandana" },
      { name: "description", content: "Shayari by Vandana, gathered by theme." },
      { property: "og:title", content: "Category — Vandana" },
      { property: "og:description", content: "Shayari by Vandana, gathered by theme." },
    ],
  }),
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data: cats } = useQuery(categoriesQuery);
  const cat = cats?.find((c) => c.slug === slug);
  const { data: posts } = useQuery({ ...postsQuery({ category: cat?.id }), enabled: !!cat });
  if (cats && !cat) return <SiteLayout><EmptyNote text="Category not found." /></SiteLayout>;
  return (
    <SiteLayout>
      <PageHeading eyebrow="Theme" title={cat?.name ?? ""} sub={cat?.description ?? undefined} />
      <div className="mx-auto max-w-6xl px-6 grid gap-px md:grid-cols-2 lg:grid-cols-3">
        {posts?.map((p) => <PoemCard key={p.id} post={p} />)}
      </div>
      {posts && !posts.length && <EmptyNote text="Nothing here yet…" />}
    </SiteLayout>
  );
}
