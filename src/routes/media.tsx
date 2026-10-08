import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { X } from "lucide-react";
import { SiteLayout, PageHeading } from "@/components/site/SiteLayout";
import { EmptyNote } from "@/components/site/PoemCard";
import { displayTitle, postMedia, postsQuery, type MediaItem } from "@/lib/data";

export const Route = createFileRoute("/media")({
  head: () => ({
    meta: [
      { title: "Photos, Videos & Recitations — Vandana" },
      { name: "description", content: "Visual poetry, photographs and spoken recitations from Vandana's published work." },
      { property: "og:title", content: "Photos, Videos & Recitations — Vandana" },
      { property: "og:description", content: "Visual poetry and spoken recitations by Vandana." },
    ],
  }),
  component: MediaPage,
});

type Entry = MediaItem & { slug: string; title: string };

function MediaPage() {
  const { data, isLoading } = useQuery(postsQuery());
  const [filter, setFilter] = useState<"all" | MediaItem["type"]>("all");
  const [open, setOpen] = useState<string | null>(null);
  const entries: Entry[] = (data ?? []).flatMap((p) => {
    const list = postMedia(p);
    const withCover = p.cover_url && !list.some((m) => m.url === p.cover_url) ? [{ url: p.cover_url, type: "image" as const }, ...list] : list;
    return withCover.map((m) => ({ ...m, slug: p.slug, title: displayTitle(p) }));
  });
  const shown = entries.filter((e) => filter === "all" || e.type === filter);
  const types = (["image", "video", "audio"] as const).filter((t) => entries.some((e) => e.type === t));
  const label = { image: "Photos", video: "Videos", audio: "Recitations" };

  return (
    <SiteLayout>
      <PageHeading eyebrow="Visual poetry" title="Media" />
      <div className="mx-auto max-w-6xl px-6">
        {!isLoading && entries.length === 0 ? <EmptyNote text="Photographs and recitations will appear here." /> : (
          <>
            {types.length > 1 && (
              <div className="flex justify-center gap-6 mb-12" role="tablist">
                {(["all", ...types] as const).map((t) => (
                  <button key={t} role="tab" aria-selected={filter === t} onClick={() => setFilter(t)} className={`eyebrow ${filter === t ? "!text-gold" : "hover:text-gold"}`}>{t === "all" ? "All" : label[t]}</button>
                ))}
              </div>
            )}
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [&>*]:mb-4">
              {shown.map((e) => (
                <figure key={e.url} className="break-inside-avoid border border-border bg-card/40">
                  {e.type === "image" && (
                    <button onClick={() => setOpen(e.url)} className="block w-full" aria-label={`View photo from ${e.title}`}>
                      <img src={e.url} alt="" loading="lazy" className="w-full" />
                    </button>
                  )}
                  {e.type === "video" && <video controls preload="metadata" src={e.url} className="w-full" aria-label={`Video: ${e.title}`} />}
                  {e.type === "audio" && <div className="p-6"><p className="eyebrow mb-3">Recitation</p><audio controls preload="none" src={e.url} className="w-full" aria-label={`Recitation: ${e.title}`} /></div>}
                  <figcaption className="px-4 py-3">
                    <Link to="/shayari/$slug" params={{ slug: e.slug }} className="font-poem text-sm text-muted-foreground hover:text-gold">{e.title} →</Link>
                  </figcaption>
                </figure>
              ))}
            </div>
          </>
        )}
      </div>
      {open && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[70] bg-background/95 grid place-items-center p-6" onClick={() => setOpen(null)}>
          <button className="absolute top-6 right-6 text-ivory" aria-label="Close"><X /></button>
          <img src={open} alt="" className="max-h-full max-w-full object-contain" />
        </div>
      )}
    </SiteLayout>
  );
}
