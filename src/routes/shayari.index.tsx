import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { SiteLayout, PageHeading } from "@/components/site/SiteLayout";
import { PoemCard, EmptyNote } from "@/components/site/PoemCard";
import { MOODS, postsQuery } from "@/lib/data";

export const Route = createFileRoute("/shayari/")({
  validateSearch: z.object({ mood: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Shayari Archive — Vandana" },
      { name: "description", content: "Every shayari Vandana has written, gathered in one quiet archive." },
      { property: "og:title", content: "Shayari Archive — Vandana" },
      { property: "og:description", content: "Every shayari Vandana has written, gathered in one quiet archive." },
    ],
  }),
  component: Archive,
});

function Archive() {
  const { mood } = Route.useSearch();
  const { data, isLoading } = useQuery(postsQuery({ mood }));
  return (
    <SiteLayout>
      <PageHeading eyebrow="The archive" title="Shayari" sub={mood ? `Mood · ${mood}` : "Every page of the diary"} />
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <Link to="/shayari" className={`eyebrow px-4 py-2 border ${!mood ? "border-gold !text-gold" : "border-border"}`}>All</Link>
          {MOODS.map((m) => (
            <Link key={m} to="/shayari" search={{ mood: m }} className={`eyebrow px-4 py-2 border ${mood === m ? "border-gold !text-gold" : "border-border"}`}>{m}</Link>
          ))}
        </div>
        {!isLoading && !data?.length ? <EmptyNote text="No pages here yet…" /> : (
          <div className="grid gap-px md:grid-cols-2 lg:grid-cols-3">{data?.map((p) => <PoemCard key={p.id} post={p} />)}</div>
        )}
      </div>
    </SiteLayout>
  );
}
