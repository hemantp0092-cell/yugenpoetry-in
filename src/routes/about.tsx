import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout, PageHeading } from "@/components/site/SiteLayout";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL, settingsQuery } from "@/lib/data";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Vandana — The Poet" },
      { name: "description", content: "Who is Vandana? The poet behind the shayari at @yugen621_." },
      { property: "og:title", content: "About Vandana — The Poet" },
      { property: "og:description", content: "The poet behind the shayari at @yugen621_." },
    ],
  }),
  component: About,
});

function About() {
  const { data: s } = useQuery(settingsQuery);
  return (
    <SiteLayout>
      <PageHeading eyebrow="The poet" title="Vandana" />
      <div className="mx-auto max-w-2xl px-6 text-center">
        <p className="font-display text-2xl leading-relaxed text-ivory whitespace-pre-line">{s?.about}</p>
        <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="inline-block mt-14 eyebrow !text-gold">{INSTAGRAM_HANDLE} →</a>
      </div>
    </SiteLayout>
  );
}
