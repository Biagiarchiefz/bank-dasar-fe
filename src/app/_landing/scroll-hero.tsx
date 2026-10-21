"use client";

import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  type MotionValue,
} from "motion/react";
import Image from "next/image";
import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Scroll-driven hero: one wide image shrinks into a card in a sticky stage,
// then two more cards slide out from behind it to form a row of three.
// Geometry is measured from the stage, so every motion value is in pixels.

type Shot = { src: string; alt: string; eyebrow: string; title: string };

// Replace the src with real photos (same paths, .jpg/.webp) when available.
const MAIN: Shot = {
  src: "/hero/donor.svg",
  alt: "Ilustrasi kantong darah dari pendonor",
  eyebrow: "UTD",
  title: "Didonorkan & diambil",
};
const LEFT: Shot = {
  src: "/hero/lab.svg",
  alt: "Ilustrasi tabung uji di laboratorium",
  eyebrow: "Laboratorium",
  title: "Diuji & diluluskan",
};
const RIGHT: Shot = {
  src: "/hero/care.svg",
  alt: "Ilustrasi kantong darah pada tiang infus",
  eyebrow: "Rumah sakit",
  title: "Ditransfusikan ke pasien",
};

type Geometry = {
  w0: number; // main image at rest: width, height, top
  h0: number;
  top0: number;
  cardW: number; // each of the three cards at the end
  cardH: number;
  top1: number;
  gap: number;
  titleTop: number;
};

function layout(w: number, h: number, heroH: number, titleH: number): Geometry {
  const sm = w >= 640;
  const pad = w >= 1024 ? 32 : sm ? 24 : 16; // same gutters as the site header
  const top = (w >= 1024 ? 80 : 64) + 8; // below the sticky site header
  const top0 = top + heroH + (sm ? 32 : 24);
  const gap = sm ? 24 : 12;
  const cardW = sm ? Math.min(380, (Math.min(w, 1280) - pad * 2 - gap * 2) / 3) : Math.round(w * 0.58);
  const titleGap = sm ? 40 : 24;
  const room = h - top - pad;
  const cardH = Math.max(180, Math.min(cardW * 1.3, room - titleH - titleGap));
  const titleTop = top + Math.max(0, (room - (titleH + titleGap + cardH)) / 2);
  return {
    w0: Math.min(w, 1280) - pad * 2,
    h0: Math.max(220, h - top0 - pad),
    top0,
    cardW,
    cardH,
    top1: titleTop + titleH + titleGap,
    gap,
    titleTop,
  };
}

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const seg = (v: number, from: number, to: number) => clamp01((v - from) / (to - from));
const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function ScrollHero({ cta }: { cta: ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const geoRef = useRef<Geometry | null>(null);
  const [geo, setGeo] = useState<Geometry | null>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  // A light spring turns coarse mouse-wheel steps into continuous motion.
  const progress = useSpring(scrollYProgress, { stiffness: 170, damping: 30, mass: 0.35, restDelta: 0.0005 });

  const mainW = useMotionValue(0);
  const mainH = useMotionValue(0);
  const mainY = useMotionValue(0);
  const heroOpacity = useMotionValue(1);
  const heroY = useMotionValue(0);
  const heroEvents = useMotionValue("auto");
  const sideX = useMotionValue(0);
  const sideXNeg = useMotionValue(0);
  const sideOpacity = useMotionValue(0);
  const sideScale = useMotionValue(0.9);
  const titleOpacity = useMotionValue(0);
  const titleY = useMotionValue(24);
  const captionOpacity = useMotionValue(0);

  const apply = useCallback(
    (v: number) => {
      const g = geoRef.current;
      if (!g) return;
      // 0 – 0.45: the main image shrinks into a card; the hero copy leaves first.
      const shrink = smooth(seg(v, 0, 0.45));
      mainW.set(lerp(g.w0, g.cardW, shrink));
      mainH.set(lerp(g.h0, g.cardH, shrink));
      mainY.set(lerp(g.top0, g.top1, shrink));
      const leave = seg(v, 0, 0.2);
      heroOpacity.set(1 - leave);
      heroY.set(-48 * leave);
      heroEvents.set(leave > 0.5 ? "none" : "auto");
      // 0.45 – 0.75: the side cards slide out from behind the main card.
      const spread = smooth(seg(v, 0.45, 0.75));
      sideX.set((g.cardW + g.gap) * spread);
      sideXNeg.set(-(g.cardW + g.gap) * spread);
      sideOpacity.set(seg(v, 0.43, 0.5));
      sideScale.set(lerp(0.9, 1, spread));
      // 0.55 – 0.9: the new title and the card captions fade in.
      const reveal = smooth(seg(v, 0.55, 0.8));
      titleOpacity.set(reveal);
      titleY.set(24 * (1 - reveal));
      captionOpacity.set(seg(v, 0.72, 0.9));
    },
    [mainW, mainH, mainY, heroOpacity, heroY, heroEvents, sideX, sideXNeg, sideOpacity, sideScale, titleOpacity, titleY, captionOpacity],
  );

  useMotionValueEvent(progress, "change", (v) => {
    if (!reduce) apply(v);
  });

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const hero = heroRef.current;
    const title = titleRef.current;
    if (!stage || !hero || !title) return;
    const measure = () => setGeo(layout(stage.clientWidth, stage.clientHeight, hero.offsetHeight, title.offsetHeight));
    measure();
    const observer = new ResizeObserver(measure);
    [stage, hero, title].forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    geoRef.current = geo;
    // Reduced motion: keep the opening frame and skip the scroll sequence.
    apply(reduce ? 0 : progress.get());
  }, [geo, reduce, apply, progress]);

  const card = "absolute left-1/2 -translate-x-1/2 overflow-hidden rounded-3xl shadow-2xl shadow-stone-300/50";

  return (
    <section
      ref={sectionRef}
      aria-label="Pembuka"
      className={cn("relative -mt-16 bg-[#FDFBF7] lg:-mt-20", reduce ? "h-svh" : "h-[260vh]")}
    >
      <div ref={stageRef} className="sticky top-0 h-svh overflow-clip">
        <motion.div
          ref={heroRef}
          style={{ opacity: heroOpacity, y: heroY, pointerEvents: heroEvents }}
          className="absolute inset-x-0 top-[72px] mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:top-[88px] lg:px-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12"
        >
          <h1 className="max-w-3xl text-[2.6rem] leading-[1] font-extrabold tracking-[-0.045em] text-slate-900 sm:text-6xl lg:text-7xl">
            Darah yang aman, dari pendonor sampai <span className="text-primary">pasien.</span>
          </h1>
          <div className="max-w-sm lg:pb-1">
            <p className="text-base text-slate-600 sm:text-lg">
              Satu sistem untuk UTD dan Bank Darah RS. Setiap kantong punya satu identitas yang bisa dilacak.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {cta}
              <Button asChild variant="outline" size="lg" className="bg-transparent">
                <a href="#fitur">Lihat fitur</a>
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div
          ref={titleRef}
          aria-hidden={!geo}
          style={{ top: geo?.titleTop ?? 0, opacity: titleOpacity, y: titleY }}
          className="pointer-events-none absolute inset-x-0 mx-auto max-w-3xl px-4 text-center"
        >
          <p className="text-sm font-semibold text-primary">Satu kantong, satu jejak</p>
          <h2 className="mt-3 text-3xl leading-[1.08] font-extrabold tracking-[-0.03em] text-slate-900 sm:text-5xl">
            Dari lengan pendonor sampai samping pasien.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate-600 sm:text-lg">
            Diambil, diuji, lalu ditransfusikan. Setiap langkah tercatat dalam satu sistem.
          </p>
        </motion.div>

        {geo && (
          <>
            <motion.div
              style={{ top: geo.top1, width: geo.cardW, height: geo.cardH, x: sideXNeg, opacity: sideOpacity, scale: sideScale }}
              className={cn(card, "z-10")}
            >
              <ShotFill shot={LEFT} caption={captionOpacity} />
            </motion.div>
            <motion.div
              style={{ top: geo.top1, width: geo.cardW, height: geo.cardH, x: sideX, opacity: sideOpacity, scale: sideScale }}
              className={cn(card, "z-10")}
            >
              <ShotFill shot={RIGHT} caption={captionOpacity} />
            </motion.div>
          </>
        )}

        <motion.div
          style={{ top: 0, width: mainW, height: mainH, y: mainY }}
          className={cn(card, "z-20 transition-opacity duration-500", geo ? "opacity-100" : "opacity-0")}
        >
          <ShotFill shot={MAIN} caption={captionOpacity} priority />
        </motion.div>
      </div>
    </section>
  );
}

function ShotFill({ shot, caption, priority }: { shot: Shot; caption: MotionValue<number>; priority?: boolean }) {
  return (
    <>
      <Image src={shot.src} alt={shot.alt} fill priority={priority} unoptimized sizes="100vw" className="object-cover" />
      <motion.div
        style={{ opacity: caption }}
        className="absolute inset-x-3 bottom-3 rounded-2xl bg-white/90 p-4 backdrop-blur-md sm:inset-x-4 sm:bottom-4"
      >
        <p className="text-xs font-semibold text-primary">{shot.eyebrow}</p>
        <p className="mt-0.5 font-bold tracking-tight text-slate-900">{shot.title}</p>
      </motion.div>
    </>
  );
}
