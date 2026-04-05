// Module-level Lenis instance — lets any component call lenis.scrollTo()
// without prop drilling or context overhead.

let _lenis = null;

export function setLenis(instance) {
  _lenis = instance;
}

export function lenisScrollTo(target, options = {}) {
  if (_lenis) {
    _lenis.scrollTo(target, options);
  } else {
    // Fallback for before Lenis mounts
    const el = typeof target === "string" ? document.querySelector(target) : target;
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }
}
