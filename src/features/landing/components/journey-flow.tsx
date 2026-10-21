"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { journey } from "../content";
import { CollectionArt, DeliveryArt, LabArt, ProcessingArt, ScreeningArt, TransfusionArt } from "./line-art";
import { NavButton } from "./nav-button";

// "Alur kantong": follow one bag through six steps. From lg up the stage is
// pinned and scrolling picks the active step; below lg, pills and arrow
// buttons do. The mock screens use sample values and are decorative.

const LG = "(min-width: 1024px)";
const subscribeLg = (cb: () => void) => {
  const mq = window.matchMedia(LG);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

const tints = ["bg-amber-100", "bg-rose-100", "bg-sky-100", "bg-emerald-100", "bg-indigo-100", "bg-teal-100"];
const arts = [ScreeningArt, CollectionArt, LabArt, ProcessingArt, DeliveryArt, TransfusionArt];

export function JourneyFlow() {
  const trackRef = useRef<HTMLDivElement>(null);
  const pillsRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const isLg = useSyncExternalStore(subscribeLg, () => window.matchMedia(LG).matches, () => false);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (isLg) setActive(Math.min(journey.length - 1, Math.floor(v * journey.length)));
  });

  /** Desktop: scroll to the middle of a step's slice. Mobile: just switch. */
  function goTo(i: number) {
    const track = trackRef.current;
    if (isLg && track) {
      const range = track.offsetHeight - window.innerHeight;
      const top = track.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + ((i + 0.5) / journey.length) * range, behavior: reduce ? "auto" : "smooth" });
      return;
    }
    setActive(i);
    // Center the pill by scrolling the row only; scrollIntoView would also move the page.
    const row = pillsRef.current;
    const pill = row?.children[i] as HTMLElement | undefined;
    if (row && pill) {
      row.scrollTo({ left: pill.offsetLeft - (row.clientWidth - pill.offsetWidth) / 2, behavior: reduce ? "auto" : "smooth" });
    }
  }

  const step = journey[active];
  const Art = arts[active];

  return (
    <section id="alur" className="scroll-mt-20 bg-[#FDFBF7]">
      <header className="mx-auto max-w-3xl px-4 pt-24 pb-10 text-center sm:px-6 lg:pb-12">
        <p className="text-xs font-bold tracking-[0.12em] text-primary uppercase">Alur kantong</p>
        <h2 className="mt-4 text-4xl leading-[1.05] font-extrabold tracking-[-0.04em] text-slate-900 sm:text-6xl">
          Enam tahap, <span className="font-serif font-normal tracking-normal italic">satu</span> jejak.
        </h2>
        <p className="mt-5 text-lg text-slate-600">
          Setiap perpindahan status dicatat bersama waktu dan petugasnya. Ikuti perjalanan satu kantong darah.
        </p>
      </header>

      <div ref={trackRef} className="relative lg:h-[420vh]">
        <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:sticky lg:top-[max(6rem,calc(50svh-10.5rem))] lg:px-8 lg:pb-16">
          <div className="grid w-full items-center gap-10 lg:grid-cols-12 lg:gap-16">
            {/* Desktop step list with a scroll-linked progress rail */}
            <ol className="relative hidden lg:col-span-5 lg:block">
              <span className="absolute top-0 bottom-0 left-0 w-0.5 rounded-full bg-stone-200" aria-hidden />
              <motion.span
                style={{ scaleY: scrollYProgress }}
                className="absolute top-0 bottom-0 left-0 w-0.5 origin-top rounded-full bg-primary"
                aria-hidden
              />
              {journey.map((s, i) => (
                <li key={s.title}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={i === active ? "step" : undefined}
                    className="group w-full py-3 pl-8 text-left"
                  >
                    <span className="flex items-baseline gap-4">
                      <span
                        className={cn(
                          "text-sm font-bold tabular-nums transition-colors",
                          i === active ? "text-primary" : "text-slate-400",
                        )}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={cn(
                          "text-2xl font-extrabold tracking-[-0.02em] transition-colors",
                          i === active ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600",
                        )}
                      >
                        {s.title}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "grid transition-[grid-template-rows,opacity] duration-300",
                        i === active ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                      )}
                    >
                      <span className="overflow-hidden">
                        <span className="block pt-2 pl-9 text-slate-600">{s.body}</span>
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>

            {/* Mobile step pills */}
            <div
              ref={pillsRef}
              className="relative -mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:hidden [&::-webkit-scrollbar]:hidden"
            >
              {journey.map((s, i) => (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-current={i === active ? "step" : undefined}
                  className={cn(
                    "h-10 shrink-0 rounded-full px-4 text-sm font-semibold whitespace-nowrap transition-colors",
                    i === active
                      ? "bg-primary text-primary-foreground"
                      : "border border-stone-300 bg-white text-slate-700",
                  )}
                >
                  {String(i + 1).padStart(2, "0")} {s.title}
                </button>
              ))}
            </div>

            {/* Illustration of the active step */}
            <div className="lg:col-span-7">
              <div
                className={cn(
                  "relative flex h-[26rem] items-center justify-center overflow-hidden rounded-3xl px-6 pt-14 pb-14 shadow-lg shadow-stone-200/50 transition-colors duration-500 sm:px-8",
                  tints[active],
                )}
              >
                <p className="absolute top-5 left-6 text-sm font-semibold text-slate-700">
                  Tahap {active + 1} dari {journey.length}
                </p>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, y: reduce ? 0 : 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: reduce ? 0 : -18 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="flex h-full w-full items-center justify-center"
                  >
                    <Art className="h-full max-h-64 w-full max-w-md text-slate-900" />
                  </motion.div>
                </AnimatePresence>
                {/* the bag's trail so far */}
                <div className="absolute inset-x-6 bottom-6 flex items-center sm:inset-x-8" aria-hidden>
                  {journey.map((s, i) => (
                    <span key={s.title} className="flex flex-1 items-center last:flex-none">
                      <span className={cn("size-2.5 rounded-full", i <= active ? "bg-primary" : "bg-white")} />
                      {i < journey.length - 1 && (
                        <span className={cn("h-0.5 flex-1", i < active ? "bg-primary" : "bg-white")} />
                      )}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 lg:hidden">
                <h3 className="text-2xl font-extrabold tracking-[-0.02em] text-slate-900">{step.title}</h3>
                <p className="mt-2 text-slate-600">{step.body}</p>
                <div className="mt-6 flex justify-end gap-3 border-t border-stone-200 pt-6">
                  <NavButton label="Tahap sebelumnya" disabled={active === 0} onClick={() => goTo(active - 1)}>
                    <ChevronLeft />
                  </NavButton>
                  <NavButton
                    label="Tahap berikutnya"
                    disabled={active === journey.length - 1}
                    onClick={() => goTo(active + 1)}
                  >
                    <ChevronRight />
                  </NavButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
