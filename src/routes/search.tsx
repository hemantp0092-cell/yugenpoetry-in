import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { SiteLayout, PageHeading } from "@/components/site/SiteLayout";
import { PoemCard, EmptyNote } from "@/components/site/PoemCard";
import { postsQuery } from "@/lib/data";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search Shayari — Vandana" },
      { name: "description", content: "Search Vandana's shayari in Hindi or English, by word, mood or title." },
      { property: "og:title", content: "Search Shayari — Vandana" },
      { property: "og:description", content: "Search Vandana's shayari in Hindi or English." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const [q, setQ] = useState("");
  const { data } = useQuery(postsQuery());
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return (data ?? []).filter((p) => [p.title, p.body, p.mood ?? "", ...(p.tags ?? [])].join(" ").toLowerCase().includes(t));
  }, [q, data]);
  return (
    <SiteLayout>
      <PageHeading eyebrow="Search" title="Find a feeling" />
      <div className="mx-auto max-w-2xl px-6">
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="चाँद, yaad, love…" className="w-full bg-transparent border-b border-border focus:border-gold outline-none font-display text-3xl py-4 text-center text-ivory placeholder:text-muted-foreground" />
      </div>
      <div className="mx-auto max-w-6xl px-6 mt-16 grid gap-px md:grid-cols-2 lg:grid-cols-3">
        {results.map((p) => <PoemCard key={p.id} post={p} />)}
      </div>
      {q && !results.length && <EmptyNote text="No words match… yet." />}
    </SiteLayout>
  );
}
