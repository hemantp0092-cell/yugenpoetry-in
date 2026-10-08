import { Link } from "@tanstack/react-router";
import type { Post } from "@/lib/data";
import { formatDate, postMedia } from "@/lib/data";

export function PoemCard({ post }: { post: Post }) {
  const lines = post.body.split("\n").filter(Boolean).slice(0, 4).join("\n");
  const img = post.cover_url || postMedia(post).find((m) => m.type === "image")?.url;
  return (
    <Link
      to="/shayari/$slug"
      params={{ slug: post.slug }}
      className="group block border border-border bg-card/40 hover:border-gold/40 hover:bg-card transition-all duration-700"
    >
      {img && <img src={img} alt="" loading="lazy" className="w-full aspect-[4/3] object-cover opacity-80 group-hover:opacity-100 transition-opacity" />}
      <div className="p-8">
        <div className="flex items-center justify-between">
          <span className="eyebrow">{post.mood ?? "Shayari"}</span>
          <span className="text-[0.7rem] text-muted-foreground">{formatDate(post.published_at)}</span>
        </div>
        {post.title?.trim() && <h3 className="font-display text-3xl mt-6 text-ivory group-hover:text-gold transition-colors">{post.title}</h3>}
        {lines && <p className="poem-text mt-4 text-lg opacity-80">{lines}</p>}
        <p className="eyebrow mt-8 group-hover:text-gold transition-colors">Read →</p>
      </div>
    </Link>
  );
}

export function EmptyNote({ text }: { text: string }) {
  return (
    <div className="py-24 text-center">
      <div className="hairline w-24 mx-auto mb-10" />
      <p className="text-muted-foreground font-display italic text-2xl">{text}</p>
    </div>
  );
}
