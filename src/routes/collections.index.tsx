import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout, PageHeading } from "@/components/site/SiteLayout";
import { collectionsQuery } from "@/lib/data";

export const Route = createFileRoute("/collections/")({
  head: () => ({
    meta: [
      { title: "Collections — Vandana" },
      { name: "description", content: "Curated volumes of Vandana's shayari, like chapters of a poetry book." },
      { property: "og:title", content: "Collections — Vandana" },
      { property: "og:description", content: "Curated volumes of Vandana's shayari." },
    ],
  }),
  component: Collections,
});

function Collections() {
  const { data } = useQuery(collectionsQuery);
  return (
    <SiteLayout>
      <PageHeading eyebrow="Volumes" title="Collections" />
      <div className="mx-auto max-w-4xl px-6 divide-y divide-border border-y border-border">
        {data?.map((c, i) => (
          <Link key={c.id} to="/collections/$slug" params={{ slug: c.slug }} className="group flex items-baseline gap-8 py-10">
            <span className="font-display text-2xl text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h2 className="font-display text-4xl text-ivory group-hover:text-gold transition-colors">{c.title}</h2>
              <p className="mt-2 text-muted-foreground">{c.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </SiteLayout>
  );
}
