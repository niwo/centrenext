import type { Locale } from "@/lib/site-config";

export type CoreI18nData = {
  landing: {
    localeLinkLabel: string;
  };
  days: Record<string, string>;
  nav: {
    about: string;
    team: string;
    services: string;
    posts: string;
    search: string;
    location: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    primaryCta: string;
    secondaryCta: string;
  };
  about: {
    title?: string;
    detailLink?: string;
  };
  team: {
    title?: string;
    detailLink?: string;
    intro?: string;
    schedule?: {
      title?: string;
      morning?: string;
      afternoon?: string;
    };
  };
  services: {
    title?: string;
    intro?: string;
    pricePrefix?: string;
    detailLink?: string;
    priceLabel?: string;
    unitLabel?: string;
    unitSessionLabel?: string;
    insuranceLabel?: string;
    insuranceObligatoryLabel?: string;
    insuranceSupplementaryLabel?: string;
    insuranceNoCoverageLabel?: string;
    insuranceSupplementaryInsurersLabel?: string;
    insuranceAllInsurersLabel?: string;
    insuranceAllExceptLabel?: string;
    insuranceCoveredLabel?: string;
    insuranceNotCoveredLabel?: string;
  };
  posts: {
    title?: string;
    sectionTitle?: string;
    intro?: string;
    detailLink?: string;
    showAllLabel?: string;
  };
  location: {
    title?: string;
    intro?: string;
    detailLink?: string;
    practiceDetailLink?: string;
    addressLabel?: string;
    openingHoursLabel?: string;
    mapLabel?: string;
  };
  testimonials: {
    kicker: string;
    title: string;
    intro: string;
  };
  footer: {
    contactKicker: string;
    backLink: string;
    detailKicker: string;
    emailLabel: string;
    phoneLabel: string;
    adminLabel: string;
  };
};

export type CoreI18nDataInput = {
  landing?: Partial<CoreI18nData["landing"]>;
  days?: Record<string, string>;
  nav?: Partial<CoreI18nData["nav"]>;
  hero?: Partial<CoreI18nData["hero"]>;
  about?: CoreI18nData["about"];
  team?: CoreI18nData["team"];
  services?: CoreI18nData["services"];
  posts?: CoreI18nData["posts"];
  location?: CoreI18nData["location"];
  testimonials?: Partial<CoreI18nData["testimonials"]>;
  footer?: Partial<CoreI18nData["footer"]>;
};

const coreI18nByLocale: Record<Locale, CoreI18nData> = {
  de: {
    landing: {
      localeLinkLabel: "Zur deutschen Version",
    },
    days: {
      monday: "Montag",
      tuesday: "Dienstag",
      wednesday: "Mittwoch",
      thursday: "Donnerstag",
      friday: "Freitag",
      saturday: "Samstag",
      sunday: "Sonntag",
    },
    nav: {
      about: "Praxis",
      team: "Team",
      services: "Angebote",
      posts: "News",
      search: "Suche",
      location: "Kontakt",
    },
    hero: {
      eyebrow: "Die Praxis fuer das ganzheitliche Wohlbefinden",
      title: "Physiotherapie, Coaching und mehr in Biel - finden Sie die passenden Angebote fuer Ihr Wohlbefinden.",
      primaryCta: "Angebote ansehen",
      secondaryCta: "Kontakt entdecken",
    },
    about: {},
    team: {},
    services: {},
    posts: {},
    location: {},
    testimonials: {
      kicker: "Erfahrungsberichte",
      title: "Was unsere Kundinnen und Kunden sagen",
      intro: "",
    },
    footer: {
      contactKicker: "Kontakt",
      backLink: "Zurueck zur Startseite",
      detailKicker: "Detailseite",
      emailLabel: "E-Mail",
      phoneLabel: "Telefon",
      adminLabel: "CMS Admin",
    },
  },
  fr: {
    landing: {
      localeLinkLabel: "Version francaise",
    },
    days: {
      monday: "Lundi",
      tuesday: "Mardi",
      wednesday: "Mercredi",
      thursday: "Jeudi",
      friday: "Vendredi",
      saturday: "Samedi",
      sunday: "Dimanche",
    },
    nav: {
      about: "Cabinet",
      team: "Equipe",
      services: "Prestations",
      posts: "Articles",
      search: "Recherche",
      location: "Contact",
    },
    hero: {
      eyebrow: "Le cabinet pour le bien-etre holistique",
      title: "Physiotherapie, coaching et plus encore a Bienne - trouvez les prestations adaptees a votre bien-etre.",
      primaryCta: "Voir les prestations",
      secondaryCta: "Voir le contact",
    },
    about: {},
    team: {},
    services: {},
    posts: {},
    location: {},
    testimonials: {
      kicker: "Temoignages",
      title: "Ce que disent nos clients",
      intro: "",
    },
    footer: {
      contactKicker: "Contact",
      backLink: "Retour a la page d'accueil",
      detailKicker: "Detail",
      emailLabel: "E-mail",
      phoneLabel: "Telephone",
      adminLabel: "Admin CMS",
    },
  },
};

export function mergeI18nWithCore(locale: Locale, input?: CoreI18nDataInput): CoreI18nData {
  const core = coreI18nByLocale[locale];

  return {
    landing: {
      ...core.landing,
      ...(input?.landing ?? {}),
    },
    days: {
      ...core.days,
      ...(input?.days ?? {}),
    },
    nav: {
      ...core.nav,
      ...(input?.nav ?? {}),
    },
    hero: {
      ...core.hero,
      ...(input?.hero ?? {}),
    },
    about: {
      ...core.about,
      ...(input?.about ?? {}),
    },
    team: {
      ...core.team,
      ...(input?.team ?? {}),
    },
    services: {
      ...core.services,
      ...(input?.services ?? {}),
    },
    posts: {
      ...core.posts,
      ...(input?.posts ?? {}),
    },
    location: {
      ...core.location,
      ...(input?.location ?? {}),
    },
    testimonials: {
      ...core.testimonials,
      ...(input?.testimonials ?? {}),
      intro: input?.testimonials?.intro ?? core.testimonials.intro,
    },
    footer: {
      ...core.footer,
      ...(input?.footer ?? {}),
    },
  };
}
