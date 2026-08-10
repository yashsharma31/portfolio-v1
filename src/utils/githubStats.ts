import type { ContributionDay } from "@/utils/githubContributions";

export type YearTotal = { year: number; count: number };

function asCount(n: unknown): number {
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) ? v : 0;
}

/** Last `span` calendar years ending at `endYear`, floored at shipping year. */
export function lastYears(
  totals: Record<string, number>,
  endYear: number,
  span: number,
  sinceYear: number
): YearTotal[] {
  const start = Math.max(sinceYear, endYear - span + 1);
  const out: YearTotal[] = [];
  for (let y = start; y <= endYear; y++) {
    out.push({ year: y, count: asCount(totals[String(y)]) });
  }
  return out;
}

export function currentStreak(days: ContributionDay[]): number {
  const today = new Date().toISOString().slice(0, 10);
  const sorted = [...days].sort((a, b) => (a.date < b.date ? -1 : 1));
  let streak = 0;
  let sawToday = false;
  for (let i = sorted.length - 1; i >= 0; i--) {
    const d = sorted[i];
    if (d.date > today) continue;
    if (d.date === today) {
      sawToday = true;
      if (asCount(d.count) > 0) streak++;
      continue;
    }
    if (!sawToday && streak === 0) {
      sawToday = true;
    }
    if (asCount(d.count) > 0) streak++;
    else break;
  }
  return streak;
}

export function lastNWeeks(
  days: ContributionDay[],
  n: number
): ContributionDay[][] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - n * 7);
  const recent = [...days]
    .filter((d) => new Date(d.date + "T00:00:00") >= cutoff)
    .sort((a, b) => (a.date < b.date ? -1 : 1));
  if (recent.length === 0) return [];
  const first = new Date(recent[0].date + "T00:00:00");
  const pad = first.getDay();
  const padded: (ContributionDay | null)[] = [
    ...Array.from({ length: pad }, () => null),
    ...recent,
  ];
  const weeks: ContributionDay[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    const slice = padded
      .slice(i, i + 7)
      .filter((d): d is ContributionDay => d !== null);
    if (slice.length) weeks.push(slice);
  }
  return weeks.slice(-n);
}

export function sumYears(years: YearTotal[]): number {
  return years.reduce((acc, y) => acc + asCount(y.count), 0);
}

export function activeDayCount(weeks: ContributionDay[][]): number {
  let n = 0;
  for (const week of weeks) {
    for (const day of week) {
      if (asCount(day.count) > 0) n++;
    }
  }
  return n;
}

export function peakYear(years: YearTotal[]): YearTotal | null {
  if (!years.length) return null;
  return years.reduce((best, y) =>
    asCount(y.count) > asCount(best.count) ? y : best
  );
}

/** Month label anchors for the ribbon (week index → short month). */
export function monthMarks(
  weeks: ContributionDay[][]
): { weekIndex: number; label: string }[] {
  const marks: { weekIndex: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const day = week[0];
    if (!day) return;
    const month = new Date(day.date + "T00:00:00").getMonth();
    if (month === lastMonth) return;
    lastMonth = month;
    // Skip first column if it would collide with the previous label.
    if (marks.length && wi - marks[marks.length - 1].weekIndex < 3) return;
    marks.push({
      weekIndex: wi,
      label: new Date(day.date + "T00:00:00").toLocaleString("en-US", {
        month: "short",
      }),
    });
  });
  return marks;
}
