import type { ContributionDay } from "@/utils/githubContributions";
import { monthMarks } from "@/utils/githubStats";

const CELL = 12;
const GAP = 3;
const LABEL_H = 16;

const LEVEL_FILL = [
  "var(--color-subtle)",
  "color-mix(in srgb, var(--color-accent) 28%, var(--color-subtle))",
  "color-mix(in srgb, var(--color-accent) 52%, var(--color-subtle))",
  "color-mix(in srgb, var(--color-accent) 78%, var(--color-subtle))",
  "var(--color-accent)",
] as const;

type Props = {
  weeks: ContributionDay[][];
};

export default function ContributionRibbon({ weeks }: Props) {
  const ribbonW = Math.max(0, weeks.length * (CELL + GAP) - GAP);
  const gridH = 7 * (CELL + GAP) - GAP;
  const ribbonH = gridH + LABEL_H;
  const marks = monthMarks(weeks);

  return (
    <div className="w-full overflow-x-auto scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <svg
        data-proof-ribbon
        width={ribbonW}
        height={ribbonH}
        viewBox={`0 0 ${ribbonW} ${ribbonH}`}
        className="block max-w-none shrink-0 overflow-visible"
        role="img"
        aria-label="GitHub contributions over the last 52 weeks"
      >
        {marks.map((m) => (
          <text
            key={`${m.label}-${m.weekIndex}`}
            x={m.weekIndex * (CELL + GAP)}
            y={10}
            fill="var(--color-ink-tertiary)"
            fontSize="10"
            fontFamily="var(--font-mono)"
          >
            {m.label}
          </text>
        ))}
        <g transform={`translate(0, ${LABEL_H})`}>
          {weeks.map((week, wi) =>
            week.map((day) => {
              const dow = new Date(day.date + "T00:00:00").getDay();
              return (
                <rect
                  key={day.date}
                  x={wi * (CELL + GAP)}
                  y={dow * (CELL + GAP)}
                  width={CELL}
                  height={CELL}
                  rx={2.5}
                  fill={LEVEL_FILL[day.level] ?? LEVEL_FILL[0]}
                  className="transition-[fill] duration-200"
                >
                  <title>
                    {day.count} on {day.date}
                  </title>
                </rect>
              );
            })
          )}
        </g>
      </svg>
    </div>
  );
}
