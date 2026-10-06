import { Link } from "@tanstack/react-router";
import type { Post } from "@/lib/data";
import { formatDate } from "@/lib/data";

export function PoemCard({ post }: { post: Post }) {
  const lines = post.body.split("\n").filter(Boolean).slice(0, 4).join("\n");
  return (
    <Link
      to="/shayari/$slug"
      params={{ slug: post.slug }}
      className="group block border border-border bg-card/40 p-8 hover:border-gold/40 hover:bg-card transition-all duration-700"
    >
      <div className="flex items-center justify-between">
        <span className="eyebrow">{post.mood ?? "Shayari"}</span>
        <span className="text-[0.7rem] text-muted-foreground">{formatDate(post.published_at)}</span>
      </div>
      <h3 className="font-display text-3xl mt-6 text-ivory group-hover:text-gold transition-colors">{post.title}</h3>
      <p className="poem-text mt-4 text-lg opacity-80">{lines}</p>
      <p className="eyebrow mt-8 group-hover:text-gold transition-colors">Read →</p>
    </Link>
  );
}

export function EmptyNote({ text }: { text: string }) {
  return <p className="text-center text-muted-foreground font-display italic text-xl py-20">{text}</p>;
}
