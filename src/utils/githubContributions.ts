/**
 * Fetch + merge GitHub contribution calendars across personal and work accounts.
 * Levels are recomputed from merged daily totals (quartile of the max day).
 */

export type ContributionDay = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

export type ContributionsPayload = {
  total: Record<string, number>;
  contributions: ContributionDay[];
};

const API_BASE = "https://github-contributions-api.jogruber.de/v4";

export function contributionsUrl(username: string): string {
  return `${API_BASE}/${username}`;
}

export async function fetchContributions(
  username: string,
  signal?: AbortSignal
): Promise<ContributionsPayload> {
  const res = await fetch(contributionsUrl(username), { signal });
  if (!res.ok) throw new Error(`contributions ${username}: ${res.status}`);
  const data = (await res.json()) as ContributionsPayload;
  if (!data.contributions?.length) {
    throw new Error(`contributions ${username}: empty`);
  }
  return data;
}

/** Map date → summed count across accounts. */
export function mergeContributionMap(
  payloads: ContributionsPayload[]
): Map<string, number> {
  const map = new Map<string, number>();
  for (const payload of payloads) {
    for (const day of payload.contributions) {
      map.set(day.date, (map.get(day.date) ?? 0) + day.count);
    }
  }
  return map;
}

export function mergeYearTotals(
  payloads: ContributionsPayload[]
): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const payload of payloads) {
    for (const [year, n] of Object.entries(payload.total ?? {})) {
      totals[year] = (totals[year] ?? 0) + (n ?? 0);
    }
  }
  return totals;
}

export function levelFromCount(count: number, max: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  if (max <= 0) return 1;
  const q = count / max;
  if (q <= 0.25) return 1;
  if (q <= 0.5) return 2;
  if (q <= 0.75) return 3;
  return 4;
}

export function mapToDays(map: Map<string, number>): ContributionDay[] {
  let max = 0;
  for (const count of map.values()) {
    if (count > max) max = count;
  }
  return [...map.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, count]) => ({
      date,
      count,
      level: levelFromCount(count, max),
    }));
}

/** Merge one or more account payloads into a single calendar + year totals. */
export function mergeContributions(
  payloads: ContributionsPayload[]
): ContributionsPayload {
  if (payloads.length === 0) {
    return { total: {}, contributions: [] };
  }
  if (payloads.length === 1) return payloads[0];
  return {
    total: mergeYearTotals(payloads),
    contributions: mapToDays(mergeContributionMap(payloads)),
  };
}

/** Fetch every username; keep successes. Rejects only if all fail. */
export async function fetchMergedContributions(
  usernames: readonly string[],
  signal?: AbortSignal
): Promise<ContributionsPayload> {
  const settled = await Promise.allSettled(
    usernames.map((u) => fetchContributions(u, signal))
  );
  const ok = settled
    .filter(
      (r): r is PromiseFulfilledResult<ContributionsPayload> =>
        r.status === "fulfilled"
    )
    .map((r) => r.value);
  if (!ok.length) {
    const first = settled.find((r) => r.status === "rejected") as
      | PromiseRejectedResult
      | undefined;
    throw first?.reason ?? new Error("all contribution fetches failed");
  }
  return mergeContributions(ok);
}
