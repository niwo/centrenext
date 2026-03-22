import Image from "next/image";
import Link from "next/link";
import { Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getItemHref, getSectionHref } from "@/lib/routes";
import type { Locale } from "@/lib/site-config";

type TeamSectionProps = {
  locale: Locale;
  team: {
    title: string;
    intro: string;
    kicker: string;
    detailLink: string;
    people: Array<{
      slug: string;
      name: string;
      slogan?: string;
      role: string;
      image?: string;
    }>;
  };
};

export function TeamSection({ team, locale }: TeamSectionProps) {
  return (
    <section id="team" className="section-shell flex flex-col gap-6">
      <div className="space-y-2">
        <p className="section-kicker">{team.kicker}</p>
        <h2 className="section-title">{team.title}</h2>
        <p className="max-w-2xl text-base leading-7 text-ink/75">{team.intro}</p>
      </div>

      <div className="grid gap-5">
        {team.people.map((person) => (
          <Link key={person.slug} href={getItemHref(locale, "team", person.slug)}>
            <Card className="flex flex-col items-center gap-5 bg-[rgb(var(--surface-elevated)/0.72)] p-8 transition hover:bg-[rgb(var(--surface-card)/0.92)]">
              <div className="overflow-hidden rounded-full border border-[rgb(var(--border-soft)/0.6)]">
                <Image
                  src={person.image ?? "/images/team/christa.webp"}
                  alt={person.name}
                  width={128}
                  height={128}
                  sizes="128px"
                  className="h-[128px] w-[128px] object-cover"
                />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-forest">{person.name}</h3>
                {person.slogan ? <p className="mt-1 text-base text-ink/70">{person.slogan}</p> : null}
              </div>
            </Card>
          </Link>
        ))}
      </div>
      <Button asChild variant="outline" className="mt-auto self-start">
        <Link href={getSectionHref(locale, "team")} className="inline-flex items-center gap-2">
          <Users className="h-4 w-4" aria-hidden />
          {team.detailLink}
        </Link>
      </Button>
    </section>
  );
}