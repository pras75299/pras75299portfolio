import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import axios from "axios";
import { apiClient } from "../utils/api";

gsap.registerPlugin(ScrollTrigger);

interface Technology {
  name: string;
  icon: string;
}

export const Skills = () => {
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(apiClient.skills);
        setTechnologies(res.data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  useEffect(() => {
    if (!technologies.length) return;
    const ctx = gsap.context(() => {
      gsap.from(".sk-heading", {
        scrollTrigger: { trigger: ".sk-heading", start: "top 88%", once: true },
        y: 24, opacity: 0, duration: 0.6, ease: "power3.out",
      });
      gsap.from(".sk-chip", {
        scrollTrigger: { trigger: ".sk-chip", start: "top 90%", once: true },
        y: 14, opacity: 0, duration: 0.4, stagger: 0.03, ease: "power2.out",
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [technologies]);

  return (
    <section ref={sectionRef} className="py-24 px-6 relative z-10" id="skills">
      <div className="max-w-3xl mx-auto">
        <div className="sk-heading mb-10">
          <p className="text-xs font-mono text-primary tracking-widest uppercase mb-2">
            Skills
          </p>
          <h2 className="text-3xl font-bold text-foreground">Technologies I Use</h2>
        </div>

        {/* Chip grid */}
        <div className="flex flex-wrap gap-2">
          {technologies.map((tech, i) => (
            <div
              key={i}
              className="sk-chip px-3.5 py-2 bg-card border border-border rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors duration-200 cursor-default"
            >
              {tech.name}
            </div>
          ))}
        </div>

        {/* Subtle ticker */}
        {technologies.length > 0 && (
          <div className="mt-14 overflow-hidden">
            <div className="flex gap-8 animate-ticker whitespace-nowrap" aria-hidden="true">
              {[...technologies, ...technologies].map((t, i) => (
                <span key={i} className="text-xl font-bold text-foreground/[0.04] shrink-0">
                  {t.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
