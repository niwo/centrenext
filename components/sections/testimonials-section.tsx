"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, UserCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { TestimonialItem } from "@/lib/content";

type TestimonialsSectionProps = {
  locale: string;
  testimonials: {
    title: string;
    kicker: string;
    items: TestimonialItem[];
  };
};

const cardColors = [
  "bg-forest/5 border-forest/15",
  "bg-[rgb(var(--color-clay)/0.07)] border-[rgb(var(--color-clay)/0.2)]",
  "bg-[rgb(var(--color-mist)/0.5)] border-[rgb(var(--color-mist)/0.8)]",
  "bg-[rgb(var(--surface-elevated)/0.9)] border-[rgb(var(--color-mist)/0.5)]",
] as const;

export function TestimonialsSection({ testimonials, locale }: TestimonialsSectionProps) {
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  const singleSetWidthRef = useRef(0);
  const positionRef = useRef(0);
  const animationFrameRef = useRef(0);
  const transitionResetRef = useRef<number | null>(null);
  const scrollingItems = [...testimonials.items, ...testimonials.items, ...testimonials.items];

  useEffect(() => {
    const track = scrollTrackRef.current;

    if (!track || testimonials.items.length === 0) {
      return;
    }

    const applyTransform = () => {
      track.style.transform = `translate3d(${-positionRef.current}px, 0, 0)`;
    };

    const normalizePosition = () => {
      const singleSetWidth = singleSetWidthRef.current;

      if (singleSetWidth === 0) {
        return;
      }

      if (positionRef.current < singleSetWidth * 0.5) {
        positionRef.current += singleSetWidth;
      }

      if (positionRef.current > singleSetWidth * 1.5) {
        positionRef.current -= singleSetWidth;
      }
    };

    const updateMetrics = () => {
      const nextSetWidth = track.scrollWidth / 3;
      singleSetWidthRef.current = nextSetWidth;
      positionRef.current = nextSetWidth;
      applyTransform();
    };

    updateMetrics();
    window.addEventListener("resize", updateMetrics);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const speed = 0.35;

    const step = () => {
      if (!isPaused && isAutoScrollEnabled && !reducedMotion.matches) {
        positionRef.current += speed;
        normalizePosition();
        applyTransform();
      }

      animationFrameRef.current = window.requestAnimationFrame(step);
    };

    animationFrameRef.current = window.requestAnimationFrame(step);

    return () => {
      window.removeEventListener("resize", updateMetrics);
      window.cancelAnimationFrame(animationFrameRef.current);

      if (transitionResetRef.current !== null) {
        window.clearTimeout(transitionResetRef.current);
      }
    };
  }, [isPaused, isAutoScrollEnabled, testimonials.items.length]);

  function scrollManually(direction: "left" | "right") {
    const track = scrollTrackRef.current;
    const singleSetWidth = singleSetWidthRef.current;

    if (!track || singleSetWidth === 0) {
      return;
    }

    setIsAutoScrollEnabled(false);

    const amount = Math.max(220, singleSetWidth * 0.2);

    track.style.transition = "transform 300ms ease";
    positionRef.current += direction === "left" ? -amount : amount;

    track.style.transform = `translate3d(${-positionRef.current}px, 0, 0)`;

    if (transitionResetRef.current !== null) {
      window.clearTimeout(transitionResetRef.current);
    }

    transitionResetRef.current = window.setTimeout(() => {
      const activeTrack = scrollTrackRef.current;

      if (activeTrack) {
        if (positionRef.current < singleSetWidth) {
          positionRef.current += singleSetWidth;
        }

        if (positionRef.current >= singleSetWidth * 2) {
          positionRef.current -= singleSetWidth;
        }

        activeTrack.style.transition = "";
        activeTrack.style.transform = `translate3d(${-positionRef.current}px, 0, 0)`;
      }
    }, 320);
  }

  return (
    <section id="testimonials" className="section-shell space-y-6">
      <div className="space-y-2">
        <p className="section-kicker">{testimonials.kicker}</p>
        <h2 className="section-title">{testimonials.title}</h2>
      </div>

      <div className="testimonials-marquee-shell">
        <div className="testimonials-marquee" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
          <div ref={scrollTrackRef} className="testimonials-track">
            {scrollingItems.map((item, index) => (
              <Card
                key={`${item.slug}-${index}`}
                className={`flex w-[20rem] shrink-0 flex-col gap-4 border p-5 sm:w-[23rem] ${cardColors[index % cardColors.length]}`}
              >
                <blockquote className="flex-1 text-base leading-7 text-ink/85 italic">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>

                <div className="flex items-center gap-3">
                  {item.image ? (
                    <div className="overflow-hidden rounded-full border border-[rgb(var(--border-soft)/0.6)]">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={40}
                        height={40}
                        sizes="40px"
                        className="h-10 w-10 object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest">
                      <UserCircle className="h-7 w-7" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-forest">{item.name}</p>
                    {item.date && (
                      <p className="text-xs text-ink/50">
                        {new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(item.date))}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="testimonials-nav">
          <Button
            type="button"
            variant="outline"
            aria-label="Scroll testimonials left"
            className="h-10 w-10 p-0"
            onClick={() => scrollManually("left")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            aria-label="Scroll testimonials right"
            className="h-10 w-10 p-0"
            onClick={() => scrollManually("right")}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
