import { useEffect } from "react";
import Navbar from "../Navbar";
import Hero from "../../sections/Hero";
import About from "../../sections/About";
import Skills from "../../sections/Skills";
import Projects from "../../sections/Projects";
import Experience from "../../sections/Experience";
import Contact from "../../sections/Contact";
import SmoothScroll from "../effects/SmoothScroll";
import MouseGlow from "../effects/MouseGlow";
import PageReveal from "../effects/PageReveal";
import ScrollAnimations from "../effects/ScrollAnimations";
import ParticlesNetwork from "../effects/ParticlesNetwork";
import CustomCursor from "../effects/CustomCursor";

export default function Layout() {
  // Always dark — apply class once on mount
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <SmoothScroll>
      <div className="dark">
        <PageReveal />
        <ScrollAnimations />
        <MouseGlow />
        <ParticlesNetwork />
        <CustomCursor />
        <div className="relative z-10 min-h-screen text-slate-100">
          <Navbar />
          <main>
            <Hero />
            <About />
            <Skills />
            <Projects />
            <Experience />
            <Contact />
          </main>
        </div>
      </div>
    </SmoothScroll>
  );
}
