import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Instagram } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PoemCard } from "@/components/site/PoemCard";
import { Button } from "@/components/ui/button";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL, MOODS, categoriesQuery, collectionsQuery, postsQuery, settingsQuery } from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vandana — A Personal Universe of Shayari" },
      { name: "description", content: "Enter Vandana's private world of words — shayari on love, longing, memory and silence." },
      { property: "og:title", content: "Vandana — A Personal Universe of Shayari" },
      { property: "og:description", content: "Shayari on love, longing, memory and silence by Vandana (@yugen621_)." },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: s } = useQuery(settingsQuery);
  const { data: featured } = useQuery(postsQuery({ featured: true, limit: 1 }));
  const { data: latest } = useQuery(postsQuery({ limit: 6 }));
  const { data: cats } = useQuery(categoriesQuery);
  const { data: cols } = useQuery(collectionsQuery);
  const f = featured?.[0];

  return (
    <SiteLayout>
      <section className="relative -mt-16 h-[100svh] min-h-[640px] overflow-hidden flex items-center justify-center">
        <img src={s?.hero_image_url || hero} alt="An open diary under moonlight" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover animate-drift opacity-70" />
        <div className="absolute inset-0 bg-veil" />
        <div className="relative text-center px-6">
          <p className="eyebrow animate-reveal">Shayari · Poetry · Silence</p>
          <h1 className="font-display text-7xl md:text-[9rem] leading-none tracking-[0.25em] text-ivory mt-6 animate-reveal [animation-delay:200ms]">VANDANA</h1>
          <p className="poem-text text-2xl md:text-3xl mt-8 animate-reveal [animation-delay:700ms]">{s?.hero_tagline}</p>
          <div className="mt-12 flex flex-wrap justify-center gap-4 animate-reveal [animation-delay:1100ms]">
            <Button asChild variant="ink" size="lg"><Link to="/shayari">Read Shayari</Link></Button>
            <Button asChild variant="quiet" size="lg"><a href={INSTAGRAM_URL} target="_blank" rel="noreferrer"><Instagram /> {INSTAGRAM_HANDLE}</a></Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-6 py-28 text-center">
        <div className="hairline w-24 mx-auto mb-10" />
        <p className="font-display text-3xl md:text-4xl italic leading-snug text-ivory">{s?.intro}</p>
      </section>

      {f && (
        <section className="mx-auto max-w-3xl px-6 pb-28 text-center">
          <p className="eyebrow">Featured Shayari</p>
          <h2 className="font-display text-4xl mt-4 text-gold">{f.title}</h2>
          <p className="poem-text text-2xl md:text-3xl mt-10">{f.body}</p>
          <Link to="/shayari/$slug" params={{ slug: f.slug }} className="inline-block mt-10 eyebrow hover:text-gold">Open the page →</Link>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-6 pb-28">
        <div className="flex items-end justify-between mb-10">
          <div><p className="eyebrow">From the diary</p><h2 className="font-display text-4xl mt-2 text-ivory">Latest writings</h2></div>
          <Link to="/shayari" className="eyebrow hover:text-gold">All shayari →</Link>
        </div>
        <div className="grid gap-px md:grid-cols-2 lg:grid-cols-3">
          {latest?.map((p) => <PoemCard key={p.id} post={p} />)}
        </div>
      </section>

      <section className="border-y border-border py-20">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <p className="eyebrow">Explore by mood</p>
          <div className="mt-8 flex flex-wrap justify-center gap-x-10 gap-y-4">
            {MOODS.map((m) => (
              <Link key={m} to="/shayari" search={{ mood: m }} className="font-display text-3xl italic text-muted-foreground hover:text-gold transition-colors">{m}</Link>
            ))}
          </div>
          <div className="mt-14 flex flex-wrap justify-center gap-3">
            {cats?.map((c) => (
              <Link key={c.id} to="/category/$slug" params={{ slug: c.slug }} className="border border-border px-5 py-2 eyebrow hover:border-gold hover:text-gold">{c.name}</Link>
            ))}
          </div>
        </div>
      </section>

      {cols && cols.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-28">
          <p className="eyebrow">Collections</p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {cols.map((c) => (
              <Link key={c.id} to="/collections/$slug" params={{ slug: c.slug }} className="group relative border border-border p-12 overflow-hidden hover:border-gold/40 transition-colors">
                {c.cover_url && <img src={c.cover_url} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-25 group-hover:opacity-40 transition-opacity" />}
                <div className="relative">
                  <h3 className="font-display text-4xl text-ivory group-hover:text-gold">{c.title}</h3>
                  <p className="mt-3 text-muted-foreground">{c.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-2xl px-6 py-20 text-center">
        <p className="eyebrow">Follow the words</p>
        <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="block font-display text-5xl mt-4 text-ivory hover:text-gold">{INSTAGRAM_HANDLE}</a>
        <Link to="/about" className="inline-block mt-10 eyebrow hover:text-gold">About Vandana →</Link>
      </section>
    </SiteLayout>
  );
}
