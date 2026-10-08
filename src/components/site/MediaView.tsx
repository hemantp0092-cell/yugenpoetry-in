import { useState } from "react";
import { X } from "lucide-react";
import type { MediaItem } from "@/lib/data";

export function MediaView({ items }: { items: MediaItem[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const images = items.filter((m) => m.type === "image");
  return (
    <>
      {images.length > 0 && (
        <div className={`grid gap-2 ${images.length > 1 ? "grid-cols-2" : ""}`}>
          {images.map((m) => (
            <button key={m.url} onClick={() => setOpen(m.url)} aria-label="View photo full screen">
              <img src={m.url} alt="" loading="lazy" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
      {items.filter((m) => m.type === "video").map((m) => (
        <video key={m.url} controls preload="metadata" src={m.url} className="w-full" aria-label="Video recitation" />
      ))}
      {items.filter((m) => m.type === "audio").map((m) => (
        <audio key={m.url} controls preload="metadata" src={m.url} className="w-full" aria-label="Audio recitation" />
      ))}
      {open && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[70] bg-background/95 grid place-items-center p-6" onClick={() => setOpen(null)}>
          <button className="absolute top-6 right-6 text-ivory" aria-label="Close"><X /></button>
          <img src={open} alt="" className="max-h-full max-w-full object-contain" />
        </div>
      )}
    </>
  );
}
