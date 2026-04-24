import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { apiClient } from "../utils/api";
import { fetchCollection } from "../utils/resilientCollection";
import { ApiSectionNotice } from "./ApiSectionNotice";

gsap.registerPlugin(ScrollTrigger);

interface Technology {
  name: string;
  icon: string;
}

interface SkillApiRow {
  icon?: string;
  name?: string;
}

const SkillSkeleton = ({ delay = 0 }: { delay?: number }) => (
  <div
    className="h-10 w-28 rounded-md border border-border bg-card animate-pulse"
    style={{ animationDelay: `${delay}ms` }}
  />
);

export const Skills = () => {
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestVersion, setRequestVersion] = useState(0);
  const [requestSource, setRequestSource] = useState<"network" | "cache" | "fallback">("network");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let active = true;

    const loadSkills = async () => {
      setLoading(true);

      const result = await fetchCollection<SkillApiRow, Technology>({
        cacheKey: "skills",
        mapItem: (skill) => ({
          icon: skill.icon ?? "",
          name: skill.name ?? "Unnamed skill",
        }),
        url: apiClient.skills,
      });

      if (!active) return;

      setTechnologies(result.data);
      setRequestSource(result.source);
      setErrorMessage(result.errorMessage);
      setLoading(false);
    };

    void loadSkills();

    return () => {
      active = false;
    };
  }, [requestVersion]);

  useEffect(() => {
    if (!technologies.length) return;
    const ctx = gsap.context(() => {
      gsap.from(".sk-heading", {
        scrollTrigger: { trigger: ".sk-heading", start: "top 88%", once: true },
        y: 24,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
      });
      gsap.from(".sk-chip", {
        scrollTrigger: { trigger: ".sk-chip", start: "top 90%", once: true },
        y: 14,
        opacity: 0,
        duration: 0.4,
        stagger: 0.03,
        ease: "power2.out",
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
          <h2 className="text-3xl font-bold text-foreground">
            Technologies I Use
          </h2>
        </div>

        {!loading && requestSource !== "network" && (
          <ApiSectionNotice
            errorMessage={errorMessage}
            mode={requestSource === "cache" ? "cache" : "error"}
            onRetry={() => setRequestVersion((value) => value + 1)}
            sectionName="skills"
          />
        )}

        {/* Chip grid */}
        <div className="flex flex-wrap gap-2">
          {loading
            ? [0, 80, 160, 240, 320, 400].map((delay) => (
                <SkillSkeleton key={delay} delay={delay} />
              ))
            : technologies.map((tech, i) => (
                <div
                  key={i}
                  className="sk-chip px-3.5 py-2 bg-card border border-border rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors duration-200 cursor-default"
                >
                  {tech.name}
                </div>
              ))}
        </div>

        {!loading && technologies.length === 0 && (
          <p className="mt-4 text-sm text-muted-foreground font-mono">
            {requestSource === "fallback"
              ? "Skills are temporarily unavailable."
              : "No skills found."}
          </p>
        )}
      </div>
    </section>
  );
};
