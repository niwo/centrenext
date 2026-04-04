import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const serviceTagColorByKey: Record<string, string> = {
  physio: "border-forest/45 bg-forest/20 text-forest hover:bg-forest/30 dark:bg-forest/35 dark:text-sand dark:hover:bg-forest/45",
  sportphysio: "border-ink/60 bg-ink/80 text-sand hover:bg-ink dark:border-mist/70 dark:bg-[rgb(var(--color-ink)/0.92)] dark:text-sand dark:hover:bg-[rgb(var(--color-ink)/1)]",
  coaching: "border-clay/55 bg-clay/25 text-ink hover:bg-clay/35 dark:bg-clay/40 dark:text-sand dark:hover:bg-clay/50",
  fascias: "border-mist bg-mist/80 text-forest hover:bg-mist dark:border-white/45 dark:bg-[rgb(var(--surface-card)/1)] dark:text-ink dark:shadow-[0_0_0_1px_rgb(255_255_255/0.14)] dark:hover:bg-white",
};

const serviceColorByKey: Record<string, string> = {
  forest: "border-forest/45 bg-forest/20 text-forest hover:bg-forest/30 dark:bg-forest/35 dark:text-sand dark:hover:bg-forest/45",
  ink: "border-ink/60 bg-ink/80 text-sand hover:bg-ink dark:border-mist/70 dark:bg-[rgb(var(--color-ink)/0.92)] dark:text-sand dark:hover:bg-[rgb(var(--color-ink)/1)]",
  clay: "border-clay/55 bg-clay/25 text-ink hover:bg-clay/35 dark:bg-clay/40 dark:text-sand dark:hover:bg-clay/50",
  mist: "border-mist bg-mist/80 text-forest hover:bg-mist dark:border-white/45 dark:bg-[rgb(var(--surface-card)/1)] dark:text-ink dark:shadow-[0_0_0_1px_rgb(255_255_255/0.14)] dark:hover:bg-white",
};

const defaultServiceTagColor = "border-[rgb(var(--color-mist)/0.7)] bg-white/80 text-forest hover:bg-white dark:border-mist/70 dark:bg-[rgb(var(--surface-elevated)/0.95)] dark:text-ink dark:hover:bg-[rgb(var(--surface-card)/1)]";

export function getServiceColorClasses(color?: string, tags: string[] = []) {
  if (color) {
    const colorClass = serviceColorByKey[color];
    if (colorClass) {
      return colorClass;
    }
  }

  for (const tag of tags) {
    const colorClass = serviceTagColorByKey[tag];
    if (colorClass) {
      return colorClass;
    }
  }

  return defaultServiceTagColor;
}