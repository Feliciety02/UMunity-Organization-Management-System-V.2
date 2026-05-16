import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Heart, Target, Eye, Sparkles } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — UMunity" },
      { name: "description", content: "UMunity centralizes student organization activities and communication at the University of Mindanao." },
      { property: "og:title", content: "About — UMunity" },
      { property: "og:description", content: "UMunity centralizes student organization activities and communication at the University of Mindanao." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <PageShell>
      <section className="relative overflow-hidden bg-gradient-maroon py-24 text-primary-foreground">
        <div className="absolute inset-0 bg-hero opacity-60" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/5 px-4 py-1.5 text-xs font-medium text-gold">
            <Sparkles className="h-3.5 w-3.5" /> About UMunity
          </span>
          <h1 className="mt-6 font-display text-4xl font-bold tracking-tight md:text-6xl">
            Built to bring <span className="text-gradient-gold">UM together.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-foreground/80">
            UMunity is a centralized platform designed to streamline student organization activities, communication, and engagement inside the University of Mindanao.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-foreground/90 leading-relaxed">
            For decades, the heart of campus life has lived in scattered group chats, paper forms, and bulletin boards. UMunity changes that. By bringing every recognized student organization, event, and announcement into one beautiful, easy-to-use platform, we make it effortless for Mindanaoan students to <strong className="text-primary">discover, join, and thrive</strong> in the communities that matter to them.
          </p>
          <p className="mt-6 text-lg text-foreground/90 leading-relaxed">
            Whether you're a freshman searching for your first org, a leader managing 300 members, or an administrator overseeing 100+ groups — UMunity gives you the tools to do it confidently.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {[
            { icon: Eye, t: "Our Vision", d: "A connected UM where every student belongs to a community that empowers them." },
            { icon: Target, t: "Our Mission", d: "To unify student organizations through a single, intuitive, and reliable platform." },
            { icon: Heart, t: "Our Values", d: "Inclusion, transparency, leadership, and unwavering Mindanaoan pride." },
          ].map((v) => (
            <div key={v.t} className="rounded-3xl border border-border bg-card p-7 shadow-soft">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-gold text-primary-deep">
                <v.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-xl font-bold">{v.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-maroon p-10 text-center text-primary-foreground md:p-16">
          <div className="absolute inset-0 bg-hero opacity-40" />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Be part of the movement.</h2>
            <p className="mx-auto mt-3 max-w-xl text-primary-foreground/80">Join UMunity and shape the future of student life at UM.</p>
            <Link to="/register" className="mt-8 inline-block rounded-full bg-gradient-gold px-7 py-3 text-sm font-bold text-primary-deep shadow-soft transition-transform hover:scale-105">
              Get started today
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
