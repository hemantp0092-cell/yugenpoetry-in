import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout, PageHeading } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Write to Vandana — Contact" },
      { name: "description", content: "Send a letter to Vandana — for collaborations, readings, or simply words." },
      { property: "og:title", content: "Write to Vandana — Contact" },
      { property: "og:description", content: "Send a letter to Vandana." },
    ],
  }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(1).max(5000),
});

function Contact() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = schema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) return toast.error("Please fill every field with a valid email.");
    setSending(true);
    const { error } = await supabase.from("messages").insert(parsed.data);
    setSending(false);
    if (error) return toast.error("The letter could not be sent. Try again.");
    setSent(true);
  };
  return (
    <SiteLayout>
      <PageHeading eyebrow="Correspondence" title="Write a letter" sub="For collaborations, readings, or simply words." />
      <div className="mx-auto max-w-xl px-6">
        {sent ? (
          <p className="text-center font-display text-3xl italic text-gold">Your letter has reached her. Thank you.</p>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <Input name="name" placeholder="Your name" className="rounded-none h-12" />
            <Input name="email" type="email" placeholder="Your email" className="rounded-none h-12" />
            <Textarea name="message" placeholder="Your words…" rows={8} className="rounded-none font-poem text-lg" />
            <Button type="submit" variant="ink" size="lg" disabled={sending} className="w-full">{sending ? "Sending…" : "Send letter"}</Button>
          </form>
        )}
      </div>
    </SiteLayout>
  );
}
