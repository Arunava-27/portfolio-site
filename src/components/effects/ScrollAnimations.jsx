import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollAnimations() {
  const progressRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ── Scroll progress bar ──
      if (progressRef.current) {
        ScrollTrigger.create({
          trigger: document.documentElement,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => {
            if (progressRef.current) {
              progressRef.current.style.transform = `scaleX(${self.progress})`;
            }
          },
        });
      }

      // ── Hero text parallax on scroll ──
      const heroText = document.getElementById("hero-text-container");
      if (heroText) {
        gsap.to(heroText, {
          y: -90,
          ease: "none",
          scrollTrigger: {
            trigger: "#hero",
            start: "top top",
            end: "bottom top",
            scrub: 1.2,
          },
        });
      }

      // ── Floating decoration blobs parallax ──
      const slowBlobs = document.querySelectorAll("[data-parallax='slow']");
      slowBlobs.forEach((blob) => {
        gsap.to(blob, {
          yPercent: -55,
          ease: "none",
          scrollTrigger: {
            trigger: blob.closest("section") || blob.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: 2,
          },
        });
      });

      const fastBlobs = document.querySelectorAll("[data-parallax='fast']");
      fastBlobs.forEach((blob) => {
        gsap.to(blob, {
          yPercent: -25,
          ease: "none",
          scrollTrigger: {
            trigger: blob.closest("section") || blob.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      });

      // ── Section divider lines reveal ──
      const dividers = document.querySelectorAll("[data-gsap='divider']");
      dividers.forEach((el) => {
        gsap.from(el, {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={progressRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        transformOrigin: "left center",
        transform: "scaleX(0)",
        background: "linear-gradient(90deg, #8b5cf6, #00f5ff)",
        zIndex: 9998,
        pointerEvents: "none",
        boxShadow: "0 0 8px rgba(139,92,246,0.6)",
      }}
      aria-hidden="true"
    />
  );
}
