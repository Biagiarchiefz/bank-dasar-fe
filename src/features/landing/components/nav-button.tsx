import type { ReactNode } from "react";

/** Round arrow button for the landing carousels. */
export function NavButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-11 items-center justify-center rounded-full border border-stone-300 bg-white text-slate-900 transition-colors hover:border-slate-900 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-stone-300 [&_svg]:size-5"
    >
      {children}
    </button>
  );
}
