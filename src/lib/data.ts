import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Post = Database["public"]["Tables"]["posts"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Collection = Database["public"]["Tables"]["collections"]["Row"];
export type Settings = Database["public"]["Tables"]["site_settings"]["Row"];
export type MediaItem = { url: string; type: "image" | "video" | "audio"; name?: string };

export const DEFAULT_INSTAGRAM_URL = "https://www.instagram.com/yugen621_/";
export const MOODS = ["Love", "Longing", "Melancholy", "Nostalgia", "Hope", "Solitude", "Night"];

export function instagramHandle(url: string | null | undefined) {
  const m = (url ?? "").match(/instagram\.com\/([^/?#]+)/i);
  return m ? `@${m[1]}` : "Instagram";
}

export function postMedia(p: Pick<Post, "media" | "media_url" | "media_type">): MediaItem[] {
  const list = Array.isArray(p.media) ? (p.media as unknown as MediaItem[]) : [];
  if (list.length) return list.filter((m) => m && typeof m.url === "string");
  if (p.media_url && p.media_type) return [{ url: p.media_url, type: p.media_type as MediaItem["type"] }];
  return [];
}

/** A display title: the title, or the first line of the poem when untitled. */
export function displayTitle(p: Pick<Post, "title" | "body">) {
  if (p.title?.trim()) return p.title.trim();
  const first = p.body.split("\n").find((l) => l.trim());
  return first ? first.trim().slice(0, 60) : "Untitled";
}

export const settingsQuery = queryOptions({
  queryKey: ["settings"],
  queryFn: async () => {
    const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
    if (error) throw error;
    return data;
  },
});

type PostFilter = { limit?: number; featured?: boolean; category?: string | undefined; collection?: string | undefined; mood?: string | undefined };

export const postsQuery = (opts: PostFilter = {}) =>
  queryOptions({
    queryKey: ["posts", opts],
    queryFn: async () => {
      let q = supabase.from("posts").select("*").eq("status", "published").lte("published_at", new Date().toISOString()).order("published_at", { ascending: false });
      if (opts.featured) q = q.eq("featured", true);
      if (opts.category) q = q.eq("category_id", opts.category);
      if (opts.collection) q = q.eq("collection_id", opts.collection);
      if (opts.mood) q = q.eq("mood", opts.mood);
      if (opts.limit) q = q.limit(opts.limit);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async () => {
    const { data, error } = await supabase.from("categories").select("*").order("name");
    if (error) throw error;
    return data;
  },
});

export const collectionsQuery = queryOptions({
  queryKey: ["collections"],
  queryFn: async () => {
    const { data, error } = await supabase.from("collections").select("*").order("sort_order");
    if (error) throw error;
    return data;
  },
});

export function slugify(s: string) {
  const base = s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
  return `${base || "shayari"}-${Math.random().toString(36).slice(2, 7)}`;
}

export function formatDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export function visitorId(): string {
  const k = "vandana:visitor";
  let v = localStorage.getItem(k);
  if (!v) { v = crypto.randomUUID(); localStorage.setItem(k, v); }
  return v;
}

const LIMITS: Record<MediaItem["type"], number> = { image: 10, audio: 25, video: 50 };

export function mediaKind(file: File): MediaItem["type"] | null {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  return null;
}

export function validateFile(file: File): string | null {
  const kind = mediaKind(file);
  if (!kind) return "Only photos, videos or audio files can be added.";
  if (file.size > LIMITS[kind] * 1024 * 1024) return `This ${kind} is too large (max ${LIMITS[kind]} MB).`;
  return null;
}

export async function uploadMedia(file: File): Promise<string> {
  const err = validateFile(file);
  if (err) throw new Error(err);
  const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]+/g, "-")}`;
  const { error } = await supabase.storage.from("media").upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw error;
  const { data, error: e2 } = await supabase.storage.from("media").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
  if (e2 || !data) throw e2 ?? new Error("Could not create link");
  return data.signedUrl;
}
