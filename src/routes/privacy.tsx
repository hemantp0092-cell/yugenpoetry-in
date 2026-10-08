import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHeading } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy — Vandana" },
      { name: "description", content: "What this website records about visitors, and why." },
      { property: "og:title", content: "Privacy — Vandana" },
      { property: "og:description", content: "What this website records about visitors, and why." },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <SiteLayout>
      <PageHeading eyebrow="Plainly stated" title="Privacy" />
      <div className="mx-auto max-w-2xl px-6 space-y-6 text-muted-foreground leading-relaxed">
        <p><strong className="text-ivory">Reading.</strong> When you open a poem, a random anonymous ID stored in your browser is used to count one view per poem per day. No name, location or device fingerprint is recorded.</p>
        <p><strong className="text-ivory">Likes.</strong> A like is counted once per browser for each poem, using the same anonymous ID.</p>
        <p><strong className="text-ivory">Letters.</strong> If you write through the contact page, your name, email and message are stored privately and are readable only by Vandana. They are never published or shared.</p>
        <p><strong className="text-ivory">No trackers.</strong> This website uses no advertising or third-party tracking scripts. Fonts are loaded from Google Fonts.</p>
        <p>To have a letter you sent removed, write again through the contact page and ask.</p>
      </div>
    </SiteLayout>
  );
}
