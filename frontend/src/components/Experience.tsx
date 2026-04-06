import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDown } from "lucide-react";
import axios from "axios";
import { apiClient } from "../utils/api";

gsap.registerPlugin(ScrollTrigger);

interface ExperienceItem {
  title: string;
  company: string;
  period: string;
  description: string[];
  technologies: string[];
}

const ExpCard = ({ exp, index }: { exp: ExperienceItem; index: number }) => {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    if (open) {
      gsap.fromTo(el,
        { height: 0, opacity: 0 },
        { height: "auto", opacity: 1, duration: 0.32, ease: "power2.out" }
      );
    } else {
      gsap.to(el, { height: 0, opacity: 0, duration: 0.25, ease: "power2.in" });
    }
  }, [open]);

  return (
    <div className="exp-card bg-card border border-border rounded-lg overflow-hidden hover:border-border/80 transition-colors duration-200">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-5 py-4 cursor-pointer"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Role */}
            <h3 className="font-semibold text-foreground text-base leading-snug mb-1">
              {exp.title}
            </h3>
            {/* Company · period */}
            <p className="text-sm text-muted-foreground font-mono">
              {exp.company}&ensp;·&ensp;{exp.period}
            </p>
          </div>
          {/* Chevron */}
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground mt-1 shrink-0 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Expandable body */}
      <div ref={bodyRef} className="overflow-hidden" style={{ height: 0, opacity: 0 }}>
        <div className="px-5 pb-5 pt-1 border-t border-border/50">
          <ul className="space-y-1.5 mb-4 mt-3">
            {exp.description.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <span className="mt-2 w-1 h-1 rounded-full bg-primary shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-1.5">
            {exp.technologies.map((t, i) => (
              <span
                key={i}
                className="font-mono text-xs text-muted-foreground bg-secondary border border-border/60 px-2 py-0.5 rounded"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Experience = () => {
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(apiClient.experiences);
        setExperiences(
          res.data.map((e: any) => ({
            ...e,
            period: `${new Date(e.startDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
            })} – ${
              e.current
                ? "Present"
                : new Date(e.endDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                  })
            }`,
          }))
        );
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".exp-heading", {
        scrollTrigger: { trigger: ".exp-heading", start: "top 88%", once: true },
        y: 24, opacity: 0, duration: 0.6, ease: "power3.out",
      });
      gsap.from(".exp-card", {
        scrollTrigger: { trigger: ".exp-card", start: "top 90%", once: true },
        y: 20, opacity: 0, duration: 0.5, stagger: 0.1, ease: "power2.out",
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [experiences]);

  return (
    <section ref={sectionRef} className="py-24 px-6 relative z-10" id="experience">
      <div className="max-w-3xl mx-auto">
        <div className="exp-heading mb-10">
          <p className="text-xs font-mono text-primary tracking-widest uppercase mb-2">
            Experience
          </p>
          <h2 className="text-3xl font-bold text-foreground">Career Timeline</h2>
        </div>

        <div className="space-y-3">
          {experiences.map((exp, i) => (
            <ExpCard key={i} exp={exp} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};
