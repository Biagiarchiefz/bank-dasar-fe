// Line-art illustrations for the pastel panels on the landing page:
// slate strokes, white fills, red accents. Decorative only (aria-hidden).

const base = "h-full max-h-36 w-auto text-slate-900";
const DROP = "M0 -46 C20 -16 34 2 34 20 A34 34 0 0 1 -34 20 C-34 2 -20 -16 0 -46 Z";

export function LabelArt({ className = base }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 140" className={className} fill="none" aria-hidden>
      <g stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x="30" y="26" width="140" height="92" rx="14" className="fill-white" transform="rotate(-6 100 72)" />
        <g transform="rotate(-6 100 72)">
          <path d="M46 44 h50 M46 56 h34" />
          <rect x="122" y="38" width="34" height="26" rx="7" className="fill-red-50 stroke-primary" />
          <text x="139" y="56" textAnchor="middle" className="fill-primary stroke-none text-[13px] font-extrabold">
            O+
          </text>
          <path d="M48 76 v26 M55 76 v26 M60 76 v26 M68 76 v26 M74 76 v26 M83 76 v26 M88 76 v26 M96 76 v26 M101 76 v26 M109 76 v26" />
          <path d="M124 92 h30 M124 102 h20" />
        </g>
        <path d="M172 18 v10 M167 23 h10" />
        <circle cx="22" cy="118" r="3" />
      </g>
    </svg>
  );
}

export function ScanArt({ className = base }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 140" className={className} fill="none" aria-hidden>
      <g stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x="70" y="10" width="64" height="112" rx="14" className="fill-white" />
        <path d="M94 18 h16" />
        <path d="M84 44 v-8 h8 M120 36 h8 v8 M128 76 v8 h-8 M92 84 h-8 v-8" />
        <path d="M92 50 v24 M98 50 v24 M102 50 v24 M108 50 v24 M112 50 v24 M118 50 v24" />
        <path d="M80 62 h48" className="stroke-primary" />
        <path d="M58 88 c-6 -10 4 -18 12 -12 l0 -8 c0 -8 10 -8 10 0 v50 c0 10 -8 18 -18 18 h-6 c-10 0 -18 -8 -18 -18 v-14 c0 -8 12 -10 16 -2" className="fill-orange-200" />
        <path d="M150 30 v10 M145 35 h10" className="stroke-white" />
        <circle cx="160" cy="104" r="4" className="stroke-white" />
      </g>
    </svg>
  );
}

export function MapArt({ className = base }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 140" className={className} fill="none" aria-hidden>
      <g stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 38 l50 -16 l56 16 l54 -16 v86 l-54 16 l-56 -16 l-50 16 z" className="fill-white" />
        <path d="M70 22 v86 M126 38 v86" />
        <path d="M32 80 c14 -10 22 6 36 -2 s26 -18 44 -4" strokeDasharray="3 6" />
        <path d={DROP} transform="translate(48 60) scale(0.26)" className="fill-primary stroke-primary" />
        <path d={DROP} transform="translate(152 84) scale(0.26)" className="fill-primary stroke-primary" />
        <circle cx="104" cy="66" r="24" className="fill-indigo-50" />
        <path d="M121 83 l22 22" strokeWidth={6} />
        <path d="M94 58 a12 12 0 0 1 12 -6" />
      </g>
    </svg>
  );
}

export function BagArt({ className = base }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 140" className={className} fill="none" aria-hidden>
      <g stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M58 40 h84 l8 92 h-100 z" className="fill-white" />
        <path d="M58 40 l10 -18 h64 l10 18" className="fill-teal-50" />
        <path d="M84 40 v-6 a16 16 0 0 1 32 0 v6" />
        <rect x="74" y="58" width="52" height="56" rx="10" className="fill-red-50 stroke-primary" />
        <path d={DROP} transform="translate(100 86) scale(0.34)" className="fill-primary stroke-primary" />
        <path d="M150 52 l18 -10 M154 70 h20" />
        <circle cx="34" cy="62" r="3" />
        <path d="M36 104 v10 M31 109 h10" />
      </g>
    </svg>
  );
}

/* Lab and bedside-transfusion scenes (used by the login page benefit cards). */

const HEART = "M0 30 C-60 -10 -50 -60 -18 -60 C-6 -60 0 -50 0 -42 C0 -50 6 -60 18 -60 C50 -60 60 -10 0 30 Z";

type ArtProps = { className?: string };

export function LabArt({ className = base }: ArtProps) {
  return (
    <svg viewBox="0 0 200 140" className={className} fill="none" aria-hidden>
      <g stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        {[36, 56, 76].map((x, i) => (
          <g key={x}>
            <rect x={x} y="30" width="14" height="70" rx="7" className="fill-white" />
            <rect x={x + 3} y={[58, 48, 66][i]} width="8" height={[39, 49, 31][i]} rx="4" className="fill-red-500 stroke-none" />
          </g>
        ))}
        <rect x="28" y="78" width="70" height="10" rx="5" className="fill-sky-200" />
        <path d="M30 116 h66 M36 88 v28 M90 88 v28" />
        <rect x="112" y="26" width="62" height="84" rx="10" className="fill-white" />
        <path d="M122 42 h30 M122 56 h40 M122 70 h24" />
        <path d="M150 66 l4 4 l8 -9" className="stroke-emerald-600" />
        <circle cx="156" cy="96" r="17" className="fill-sky-50" />
        <path d="M168 108 l14 14" strokeWidth={5} />
        <path d="M148 90 a9 9 0 0 1 9 -5" />
        <path d="M186 30 v10 M181 35 h10" />
      </g>
    </svg>
  );
}

export function TransfusionArt({ className = base }: ArtProps) {
  return (
    <svg viewBox="0 0 200 140" className={className} fill="none" aria-hidden>
      <g stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M52 16 h40 M72 16 v108 M54 126 h36" />
        <rect x="54" y="22" width="36" height="48" rx="10" className="fill-white" />
        <rect x="59" y="40" width="26" height="25" rx="6" className="fill-red-500 stroke-none" />
        <rect x="68" y="72" width="8" height="12" rx="3" className="fill-white" />
        <path d="M72 84 C72 112 120 116 156 104" className="stroke-primary" />
        <path d="M118 112 h76" />
        <circle cx="138" cy="102" r="8" className="fill-white" />
        <path d="M150 110 c8 -14 30 -14 40 0" className="fill-white" />
        <rect x="116" y="26" width="66" height="42" rx="8" className="fill-white" />
        <path d="M122 50 h12 l5 -10 l7 18 l5 -8 h25" className="stroke-primary" />
        <path d={HEART} transform="translate(128 38) scale(0.13)" className="fill-primary stroke-primary" />
        <circle cx="28" cy="40" r="3" />
      </g>
    </svg>
  );
}
