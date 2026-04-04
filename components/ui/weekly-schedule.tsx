import { cn } from "@/lib/utils";

const ALL_DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
type WeekDay = (typeof ALL_DAYS)[number];
type Period = "morning" | "afternoon";

type WorkingDay = {
  day: string;
  periods: Period[];
};

type WeeklyScheduleProps = {
  schedule: WorkingDay[];
  /**
   * Localized full day names keyed by day slug, e.g. { monday: "Montag", tuesday: "Dienstag", ... }
   * The first two characters are used as the column header abbreviation.
   */
  dayLabels: Record<string, string>;
  morningLabel: string;
  afternoonLabel: string;
};

export function WeeklySchedule({ schedule, dayLabels, morningLabel, afternoonLabel }: WeeklyScheduleProps) {
  const scheduledDaySet = new Set(schedule.map((e) => e.day));

  // Always show Mon–Fri; add Sat/Sun only when they have entries.
  const daysToShow = ALL_DAYS.filter((day, i) => i < 5 || scheduledDaySet.has(day));

  const scheduleMap = new Map<string, Set<string>>(
    schedule.map((entry) => [entry.day, new Set(entry.periods)]),
  );

  // Dynamic grid: narrow label column + one equal column per day.
  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `1.75rem repeat(${daysToShow.length}, 1fr)`,
    gap: "0.25rem",
  };

  const abbrev = (day: WeekDay) => (dayLabels[day] ?? day).slice(0, 2);

  return (
    <div className="space-y-1.5">
      {/* Day header row */}
      <div style={gridStyle}>
        <div aria-hidden />
        {daysToShow.map((day) => (
          <div
            key={day}
            title={dayLabels[day] ?? day}
            className="truncate text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-clay/75"
          >
            {abbrev(day)}
          </div>
        ))}
      </div>

      {/* Morning row */}
      <div style={gridStyle} role="row" aria-label={morningLabel}>
        <div className="flex items-center justify-end pr-0.5 text-[10px] font-medium leading-none text-clay/50">
          {morningLabel.slice(0, 1).toUpperCase()}
        </div>
        {daysToShow.map((day) => {
          const active = scheduleMap.get(day)?.has("morning") ?? false;
          return (
            <div
              key={`${day}-m`}
              title={active ? `${dayLabels[day] ?? day} – ${morningLabel}` : undefined}
              className={cn(
                "h-5 rounded-t-sm rounded-b-[2px]",
                active
                  ? "bg-forest dark:bg-forest/85"
                  : "bg-[rgb(var(--surface-shell)/0.7)] dark:bg-white/[0.06]",
              )}
            />
          );
        })}
      </div>

      {/* Afternoon row */}
      <div style={gridStyle} role="row" aria-label={afternoonLabel}>
        <div className="flex items-center justify-end pr-0.5 text-[10px] font-medium leading-none text-clay/50">
          {afternoonLabel.slice(0, 1).toUpperCase()}
        </div>
        {daysToShow.map((day) => {
          const active = scheduleMap.get(day)?.has("afternoon") ?? false;
          return (
            <div
              key={`${day}-a`}
              title={active ? `${dayLabels[day] ?? day} – ${afternoonLabel}` : undefined}
              className={cn(
                "h-5 rounded-b-sm rounded-t-[2px]",
                active
                  ? "bg-clay/85 dark:bg-clay/70"
                  : "bg-[rgb(var(--surface-shell)/0.7)] dark:bg-white/[0.06]",
              )}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 pt-0.5">
        <span className="flex items-center gap-1.5 text-[10px] text-clay/60">
          <span className="inline-block h-2.5 w-4 rounded-[3px] bg-forest dark:bg-forest/85" aria-hidden />
          {morningLabel}
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-clay/60">
          <span className="inline-block h-2.5 w-4 rounded-[3px] bg-clay/85 dark:bg-clay/70" aria-hidden />
          {afternoonLabel}
        </span>
      </div>
    </div>
  );
}
