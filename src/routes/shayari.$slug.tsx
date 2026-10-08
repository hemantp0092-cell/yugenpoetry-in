import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Copy, Heart, Link2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { EmptyNote } from "@/components/site/PoemCard";
import { MediaView } from "@/components/site/MediaView";
import { displayTitle, formatDate, postMedia, visitorId } from "@/lib/data";
import { getPublicPost } from "@/lib/public.functions";

export const Route = createFileRoute("/shayari/$slug")({
  loader: ({ params }) => getPublicPost({ data: { slug: params.slug } }),
  head: ({ loaderData, params }) => {
    const p = loaderData?.post;
    if (!p) return { meta: [{ title: "Not found — Vandana" }, { name: "robots", content: "noindex" }] };
    const title = `${displayTitle(p)} — Vandana`;
    const desc = (p.description?.trim() || p.body.replace(/\s*\n\s*/g, " / ")).slice(0, 180);
    const image = p.cover_url || postMedia(p).find((m) => m.type === "image")?.url;
    const url = loaderData?.origin ? `${loaderData.origin}/shayari/${params.slug}` : undefined;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { name: "author", content: "Vandana" },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "article:author", content: "Vandana" },
        ...(url ? [{ property: "og:url", content: url }] : []),
        { name: "twitter:card", content: image ? "summary_large_image" : "summary" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        ...(image ? [{ property: "og:image", content: image }, { name: "twitter:image", content: image }] : []),
      ],
      links: url ? [{ rel: "canonical", href: url }] : [],
    };
  },
  errorComponent: () => <SiteLayout><EmptyNote text="This page could not be opened. Please try again." /></SiteLayout>,
  notFoundComponent: () => <SiteLayout><EmptyNote text="This page could not be found." /></SiteLayout>,
  component: PoemPage,
});

function PoemPage() {
  const { slug } = Route.useParams();
  const { post } = Route.useLoaderData();
  const [likes, setLikes] = useState(post?.likes ?? 0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setLiked(localStorage.getItem(`liked:${slug}`) === "1");
    supabase.rpc("record_view", { _slug: slug, _visitor: visitorId() });
  }, [slug]);

  if (!post) return <SiteLayout><EmptyNote text="This page could not be found." /></SiteLayout>;

  const title = displayTitle(post);
  const copyText = `${post.title?.trim() ? `${post.title.trim()}\n\n` : ""}${post.body}\n\n— Vandana`;
  const media = postMedia(post);

  const like = async () => {
    if (liked) return;
    setLiked(true);
    localStorage.setItem(`liked:${slug}`, "1");
    const { data } = await supabase.rpc("record_like", { _slug: slug, _visitor: visitorId() });
    if (typeof data === "number") setLikes(data);
  };
  const copy = async (text: string, msg: string) => {
    try { await navigator.clipboard.writeText(text); toast(msg); } catch { toast.error("Copying isn't allowed in this browser."); }
  };
  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: `${title} — Vandana`, url }).catch(() => {});
    } else copy(url, "Link copied — paste it anywhere to share");
  };

  return (
    <SiteLayout>
      {post.cover_url && <img src={post.cover_url} alt="" className="w-full h-[50vh] object-cover opacity-60" />}
      <article className="mx-auto max-w-2xl px-6 py-24 text-center animate-reveal">
        <p className="eyebrow">{post.mood ?? "Shayari"} · {formatDate(post.published_at)}</p>
        {post.title?.trim() && <h1 className="font-display text-5xl md:text-6xl mt-6 text-gold">{post.title}</h1>}
        {!post.title?.trim() && <h1 className="sr-only">{title}</h1>}
        <div className="hairline w-24 mx-auto my-12" />
        {post.body && <p className="poem-text text-2xl md:text-[1.9rem]">{post.body}</p>}
        {media.length > 0 && <div className="mt-12 space-y-6"><MediaView items={media} /></div>}
        {post.description && <p className="mt-12 text-muted-foreground italic font-display text-lg">{post.description}</p>}
        <p className="font-display italic text-xl mt-14 text-muted-foreground">— Vandana</p>
        <div className="mt-14 flex flex-wrap justify-center gap-8">
          <button onClick={like} aria-pressed={liked} aria-label="Like this poem" className={`flex items-center gap-2 eyebrow hover:text-gold ${liked ? "!text-wine" : ""}`}>
            <Heart className={`size-4 ${liked ? "fill-current" : ""}`} /> {likes > 0 ? likes : ""}
          </button>
          {post.body && <button onClick={() => copy(copyText, "Poetry copied")} className="flex items-center gap-2 eyebrow hover:text-gold"><Copy className="size-4" /> Copy poetry</button>}
          <button onClick={() => copy(window.location.href, "Link copied")} className="flex items-center gap-2 eyebrow hover:text-gold"><Link2 className="size-4" /> Copy link</button>
          <button onClick={share} className="flex items-center gap-2 eyebrow hover:text-gold"><Share2 className="size-4" /> Share</button>
        </div>
        <Link to="/shayari" className="inline-block mt-20 eyebrow hover:text-gold">← Back to the archive</Link>
      </article>
    </SiteLayout>
  );
}
