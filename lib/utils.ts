import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const serviceTagColorByKey: Record<string, string> = {
  physio: "border-forest/45 bg-forest/20 text-forest hover:bg-forest/30",
  sportphysio: "border-ink/60 bg-ink/80 text-sand hover:bg-ink",
  coaching: "border-clay/55 bg-clay/25 text-ink hover:bg-clay/35",
  fascias: "border-mist bg-mist/80 text-forest hover:bg-mist",
};

const serviceColorByKey: Record<string, string> = {
  forest: "border-forest/45 bg-forest/20 text-forest hover:bg-forest/30",
  ink: "border-ink/60 bg-ink/80 text-sand hover:bg-ink",
  clay: "border-clay/55 bg-clay/25 text-ink hover:bg-clay/35",
  mist: "border-mist bg-mist/80 text-forest hover:bg-mist",
};

const defaultServiceTagColor = "border-[rgb(var(--color-mist)/0.7)] bg-white/80 text-forest hover:bg-white";

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