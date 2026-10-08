import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Instagram } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { SiteLayout, useInstagram } from "@/components/site/SiteLayout";
import { PoemCard } from "@/components/site/PoemCard";
import { Button } from "@/components/ui/button";
import { categoriesQuery, collectionsQuery, displayTitle, postsQuery, settingsQuery } from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vandana — A Personal Universe of Shayari" },
      { name: "description", content: "Enter Vandana's private world of words — shayari, poetry and silence." },
      { property: "og:title", content: "Vandana — A Personal Universe of Shayari" },
      { property: "og:description", content: "The personal poetry home of Vandana." },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: s } = useQuery(settingsQuery);
  const { data: all, isLoading } = useQuery(postsQuery());
  const { data: cats } = useQuery(categoriesQuery);
  const { data: cols } = useQuery(collectionsQuery);
  const ig = useInstagram();
  const posts = all ?? [];
  const f = posts.find((p) => p.featured);
  const latest = posts.filter((p) => p.id !== f?.id).slice(0, 6);
  const usedCats = cats?.filter((c) => posts.some((p) => p.category_id === c.id)) ?? [];
  const usedCols = cols?.filter((c) => posts.some((p) => p.collection_id === c.id)) ?? [];
  const moods = [...new Set(posts.map((p) => p.mood).filter(Boolean))] as string[];

  return (
    <SiteLayout>
      <section className="relative -mt-16 h-[100svh] min-h-[640px] overflow-hidden flex items-center justify-center">
        <img src={s?.hero_image_url || hero} alt="" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover animate-drift opacity-70" />
        <div className="absolute inset-0 bg-veil" />
        <div className="relative text-center px-6">
          <p className="eyebrow animate-reveal">Shayari · Poetry · Silence</p>
          <h1 className="font-display text-6xl sm:text-7xl md:text-[9rem] leading-none tracking-[0.25em] text-ivory mt-6 animate-reveal [animation-delay:200ms]">VANDANA</h1>
          {s?.hero_tagline && <p className="poem-text text-2xl md:text-3xl mt-8 animate-reveal [animation-delay:700ms]">{s.hero_tagline}</p>}
          <div className="mt-12 flex flex-wrap justify-center gap-4 animate-reveal [animation-delay:1100ms]">
            <Button asChild variant="ink" size="lg"><Link to="/shayari">Read Shayari</Link></Button>
            <Button asChild variant="quiet" size="lg"><a href={ig.url} target="_blank" rel="noopener noreferrer"><Instagram /> {ig.handle}</a></Button>
          </div>
        </div>
      </section>

      {s?.intro && (
        <section className="mx-auto max-w-2xl px-6 py-28 text-center">
          <div className="hairline w-24 mx-auto mb-10" />
          <p className="font-display text-3xl md:text-4xl italic leading-snug text-ivory">{s.intro}</p>
        </section>
      )}

      {!isLoading && posts.length === 0 && (
        <section className="mx-auto max-w-2xl px-6 py-32 text-center">
          <div className="hairline w-24 mx-auto mb-12" />
          <p className="font-display italic text-3xl md:text-4xl text-ivory">Her words will find their way here.</p>
          <p className="eyebrow mt-8">The diary is open · the first page is yet to be written</p>
        </section>
      )}

      {f && (
        <section className="mx-auto max-w-3xl px-6 py-28 text-center">
          <p className="eyebrow">Featured</p>
          {f.title?.trim() && <h2 className="font-display text-4xl mt-4 text-gold">{f.title}</h2>}
          <p className="poem-text text-2xl md:text-3xl mt-10">{f.body}</p>
          <Link to="/shayari/$slug" params={{ slug: f.slug }} className="inline-block mt-10 eyebrow hover:text-gold">Open “{displayTitle(f)}” →</Link>
        </section>
      )}

      {latest.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex items-end justify-between mb-10">
            <div><p className="eyebrow">From the diary</p><h2 className="font-display text-4xl mt-2 text-ivory">Latest writings</h2></div>
            <Link to="/shayari" className="eyebrow hover:text-gold">All shayari →</Link>
          </div>
          <div className="grid gap-px md:grid-cols-2 lg:grid-cols-3">{latest.map((p) => <PoemCard key={p.id} post={p} />)}</div>
        </section>
      )}

      {(moods.length > 0 || usedCats.length > 0) && (
        <section className="border-y border-border py-20 mt-10">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <p className="eyebrow">Explore by feeling</p>
            <div className="mt-8 flex flex-wrap justify-center gap-x-10 gap-y-4">
              {moods.map((m) => (
                <Link key={m} to="/shayari" search={{ mood: m }} className="font-display text-3xl italic text-muted-foreground hover:text-gold transition-colors">{m}</Link>
              ))}
            </div>
            <div className="mt-12 flex flex-wrap justify-center gap-3">
              {usedCats.map((c) => (
                <Link key={c.id} to="/category/$slug" params={{ slug: c.slug }} className="border border-border px-5 py-2 eyebrow hover:border-gold hover:text-gold">{c.name}</Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {usedCols.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-28">
          <p className="eyebrow">Collections</p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {usedCols.map((c) => (
              <Link key={c.id} to="/collections/$slug" params={{ slug: c.slug }} className="group relative border border-border p-12 overflow-hidden hover:border-gold/40 transition-colors">
                {c.cover_url && <img src={c.cover_url} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-25 group-hover:opacity-40 transition-opacity" />}
                <div className="relative">
                  <h3 className="font-display text-4xl text-ivory group-hover:text-gold">{c.title}</h3>
                  {c.description && <p className="mt-3 text-muted-foreground">{c.description}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-2xl px-6 py-20 text-center">
        <p className="eyebrow">Follow the words</p>
        <a href={ig.url} target="_blank" rel="noopener noreferrer" className="block font-display text-4xl md:text-5xl mt-4 text-ivory hover:text-gold break-all">{ig.handle}</a>
      </section>
    </SiteLayout>
  );
}
