import { cn } from "@/lib/utils";
import { stats, type Stat } from "./content";

// "Dalam angka" section under the scroll hero: copy and a line-art crowd on
// the left, four colored stat cards on the right.

// -700 shades keep small white text above 4.5:1 contrast.
const toneClass: Record<Stat["tone"], string> = {
  blue: "bg-blue-600 text-white",
  amber: "bg-amber-400 text-slate-900",
  teal: "bg-teal-700 text-white",
  orange: "bg-orange-700 text-white",
};

export function NumbersSection() {
  return (
    <section className="bg-[#FDFBF7]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
        <div className="lg:col-span-5">
          <p className="inline-flex rounded-full bg-slate-900 px-4 py-1.5 text-xs font-bold tracking-[0.12em] text-white uppercase">
            SI UTD & BDRS dalam angka
          </p>
          <h2 className="mt-6 text-5xl leading-[1.02] font-extrabold tracking-[-0.04em] text-slate-900 sm:text-6xl">
            Rantai darah yang aman <span className="font-serif font-normal tracking-normal italic">memang</span>{" "}
            mungkin.
          </h2>
          <p className="mt-6 max-w-md text-lg text-slate-600">
            Dan angka-angka ini datang langsung dari cara sistemnya bekerja.
          </p>
          <CrowdIllustration className="mt-12 w-full max-w-lg text-slate-900" />
        </div>

        <ul className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
          {stats.map((s) => (
            <StatCard key={s.unit} stat={s} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function StatCard({ stat }: { stat: Stat }) {
  return (
    <li
      className={cn(
        "flex min-h-56 flex-col justify-between gap-8 rounded-3xl p-8 sm:min-h-64 shadow-xl shadow-stone-300/40 transition-transform duration-300 hover:scale-[1.02]",
        toneClass[stat.tone],
      )}
    >
      <p className="flex items-baseline gap-2 whitespace-nowrap">
        <span className="text-7xl leading-[0.85] font-extrabold tracking-[-0.05em] sm:text-8xl">{stat.value}</span>
        <span className="text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl">{stat.unit}</span>
      </p>
      <p className="max-w-xs text-base font-medium opacity-90">{stat.label}</p>
    </li>
  );
}

// Figures stand on one ground line; the cream fill hides lines behind each one.
const crowd = [
  { x: 62, s: 0.95, hair: true },
  { x: 132, s: 1.15 },
  { x: 205, s: 0.9, drop: true, hair: true },
  { x: 282, s: 1.25, heart: true },
  { x: 358, s: 1.0, hair: true },
  { x: 432, s: 1.12, drop: true },
  { x: 500, s: 0.88, hair: true },
];
const GROUND = 226;

const HEART = "M0 30 C-60 -10 -50 -60 -18 -60 C-6 -60 0 -50 0 -42 C0 -50 6 -60 18 -60 C50 -60 60 -10 0 30 Z";
const DROP = "M0 -46 C20 -16 34 2 34 20 A34 34 0 0 1 -34 20 C-34 2 -20 -16 0 -46 Z";

function CrowdIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 560 240" className={className} aria-hidden fill="none">
      <g stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        {/* sparkles */}
        <path d="M96 40 v14 M89 47 h14" />
        <path d="M470 54 v12 M464 60 h12" />
        <circle cx="390" cy="34" r="4" />

        {/* heart balloon held by the tallest figure */}
        <path d="M300 141 C306 110 296 90 310 66" />
        <path d={HEART} transform="translate(312 66) scale(0.4)" className="fill-primary stroke-primary" />

        {crowd.map(({ x, s, hair, drop, heart }) => {
          const r = 30 * s; // shoulder radius
          const top = GROUND - 30 * s - r;
          const head = 17 * s;
          const hy = top - 8 * s - head;
          return (
            <g key={x}>
              <path
                d={`M${x - r} ${GROUND} V${GROUND - 30 * s} A${r} ${r} 0 0 1 ${x + r} ${GROUND - 30 * s} V${GROUND}`}
                className="fill-[#FDFBF7]"
              />
              <circle cx={x} cy={hy} r={head} className="fill-[#FDFBF7]" />
              {hair && <path d={`M${x - head} ${hy - 2} C${x - head * 0.6} ${hy - head * 1.5} ${x + head} ${hy - head * 1.4} ${x + head} ${hy - 4}`} />}
              {heart && <path d={`M${x + r * 0.55} ${GROUND - 40 * s} L${x + r * 0.6} ${GROUND - 86 * s}`} />}
              {drop && (
                <path d={DROP} transform={`translate(${x - r * 0.35} ${GROUND - 32 * s}) scale(${0.28 * s})`} className="fill-primary stroke-primary" />
              )}
            </g>
          );
        })}

        <path d={`M16 ${GROUND} H544`} />
      </g>
    </svg>
  );
}
