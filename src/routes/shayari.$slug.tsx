import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Copy, Heart, Share2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { EmptyNote } from "@/components/site/PoemCard";
import { formatDate, postQuery } from "@/lib/data";

export const Route = createFileRoute("/shayari/$slug")({
  head: () => ({
    meta: [
      { title: "Shayari — Vandana" },
      { name: "description", content: "A shayari by Vandana." },
      { property: "og:title", content: "Shayari — Vandana" },
      { property: "og:description", content: "A shayari by Vandana." },
      { property: "og:type", content: "article" },
    ],
  }),
  component: PoemPage,
});

function PoemPage() {
  const { slug } = Route.useParams();
  const { data: post, isLoading } = useQuery(postQuery(slug));
  const [likes, setLikes] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setLiked(localStorage.getItem(`liked:${slug}`) === "1");
    const k = `viewed:${slug}`;
    if (!sessionStorage.getItem(k)) {
      sessionStorage.setItem(k, "1");
      supabase.rpc("increment_view", { _slug: slug });
    }
  }, [slug]);

  useEffect(() => { if (post?.title) document.title = `${post.title} — Vandana`; }, [post?.title]);

  if (isLoading) return <SiteLayout><div className="h-[60vh]" /></SiteLayout>;
  if (!post) return <SiteLayout><EmptyNote text="This page could not be found." /></SiteLayout>;

  const text = `${post.title}\n\n${post.body}\n\n— Vandana (@yugen621_)`;
  const like = async () => {
    if (liked) return;
    setLiked(true);
    localStorage.setItem(`liked:${slug}`, "1");
    const { data } = await supabase.rpc("increment_like", { _slug: slug });
    if (typeof data === "number") setLikes(data);
  };
  const share = async () => {
    const url = window.location.href;
    if (navigator.share) await navigator.share({ title: post.title, text: post.body, url }).catch(() => {});
    else { await navigator.clipboard.writeText(url); toast("Link copied"); }
  };

  return (
    <SiteLayout>
      {post.cover_url && <img src={post.cover_url} alt="" className="w-full h-[50vh] object-cover opacity-60" />}
      <article className="mx-auto max-w-2xl px-6 py-24 text-center animate-reveal">
        <p className="eyebrow">{post.mood ?? "Shayari"} · {formatDate(post.published_at)}</p>
        <h1 className="font-display text-5xl md:text-6xl mt-6 text-gold">{post.title}</h1>
        <div className="hairline w-24 mx-auto my-12" />
        <p className="poem-text text-2xl md:text-[1.9rem]">{post.body}</p>
        {post.media_url && post.media_type === "audio" && <audio controls src={post.media_url} className="mx-auto mt-12 w-full" />}
        {post.media_url && post.media_type === "video" && <video controls src={post.media_url} className="mt-12 w-full" />}
        <p className="font-display italic text-xl mt-14 text-muted-foreground">— Vandana</p>
        <div className="mt-14 flex justify-center gap-8">
          <button onClick={like} className={`flex items-center gap-2 eyebrow hover:text-gold ${liked ? "!text-wine" : ""}`}>
            <Heart className={`size-4 ${liked ? "fill-current" : ""}`} /> {likes ?? post.likes + (liked && likes === null ? 0 : 0)}
          </button>
          <button onClick={async () => { await navigator.clipboard.writeText(text); toast("Shayari copied"); }} className="flex items-center gap-2 eyebrow hover:text-gold"><Copy className="size-4" /> Copy</button>
          <button onClick={share} className="flex items-center gap-2 eyebrow hover:text-gold"><Share2 className="size-4" /> Share</button>
        </div>
        <Link to="/shayari" className="inline-block mt-20 eyebrow hover:text-gold">← Back to the archive</Link>
      </article>
    </SiteLayout>
  );
}
