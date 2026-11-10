"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Animations discrètes pilotées par GSAP + ScrollTrigger.
 * - [data-reveal] : apparition en fondu/translation à l'entrée dans l'écran.
 * - [data-lines] : révélation ligne par ligne des grands titres.
 * Désactivées si l'utilisateur préfère réduire les animations.
 */
export function Motion() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    (window as unknown as { __nuteMotion?: boolean }).__nuteMotion = true;
    if (!root.classList.contains("js-motion")) return;

    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        document.querySelectorAll<HTMLElement>("[data-lines]").forEach((el) => {
          const lines = el.querySelectorAll(".line > span");
          gsap.set(el, { opacity: 1 });
          gsap.fromTo(lines, { yPercent: 110, y: 0 }, { yPercent: 0, duration: 1.1, ease: "power4.out", stagger: 0.08, delay: 0.1 });
        });
        const items = gsap.utils.toArray<HTMLElement>("[data-reveal]");
        gsap.set(items, { opacity: 0, y: 24 });
        // Les éléments ajoutés plus tard (filtres) restent visibles sans animation.
        root.classList.add("motion-ready");
        ScrollTrigger.batch(items, {
          start: "top 92%",
          once: true,
          onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.06, overwrite: true }),
        });
        // Éléments déjà visibles au chargement.
        ScrollTrigger.refresh();
      });
    })().catch(() => root.classList.remove("js-motion"));

    return () => {
      cancelled = true;
      ctx?.revert();
      root.classList.remove("motion-ready");
    };
  }, [pathname]);

  return null;
}
