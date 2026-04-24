import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, Github } from "lucide-react";
import { apiClient } from "../utils/api";
import { fetchCollection } from "../utils/resilientCollection";
import { ApiSectionNotice } from "./ApiSectionNotice";

gsap.registerPlugin(ScrollTrigger);

interface Project {
  title: string;
  image: string;
  tech: string[];
  github: string;
  live: string;
  category: string;
}

interface ProjectApiRow {
  category?: string;
  githubUrl?: string;
  image?: string;
  liveUrl?: string;
  technologies?: string[];
  title?: string;
}

// ── Skeleton — mirrors ProjectCard layout exactly ─────────────────────────────
const ProjectSkeleton = ({ delay = 0 }: { delay?: number }) => (
  <div
    className="bg-card border border-border rounded-lg p-5 flex flex-col gap-4"
    style={{ animationDelay: `${delay}ms` }}
  >
    {/* Category chip + title row */}
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="h-2.5 w-14 rounded bg-muted animate-pulse mb-2" />
        <div className="h-4 w-4/5 rounded bg-muted animate-pulse" />
      </div>
      {/* Icon buttons */}
      <div className="flex items-center gap-2 shrink-0 mt-0.5">
        <div className="h-7 w-7 rounded border border-border bg-muted animate-pulse" />
        <div className="h-7 w-7 rounded border border-border bg-muted animate-pulse" />
      </div>
    </div>
    {/* Tech chips */}
    <div className="flex flex-wrap gap-1.5 mt-auto">
      {[56, 44, 68, 50].map((w, i) => (
        <div
          key={i}
          className="h-5 rounded bg-muted animate-pulse"
          style={{ width: w, animationDelay: `${delay + i * 60}ms` }}
        />
      ))}
    </div>
  </div>
);

// ── Real card ─────────────────────────────────────────────────────────────────
const ProjectCard = ({ project }: { project: Project }) => (
  <div className="proj-card group bg-card border border-border rounded-lg p-5 flex flex-col gap-4 hover:border-border/80 transition-colors duration-200">
    {/* Header */}
    <div className="flex items-start justify-between gap-3">
      <div>
        <span className="font-mono text-[10px] text-primary tracking-widest uppercase mb-2 block">
          {project.category}
        </span>
        <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors duration-200 leading-snug">
          {project.title}
        </h3>
      </div>

      {/* Action icons */}
      <div className="flex items-center gap-2 shrink-0 mt-0.5">
        {project.live && (
          <a
            href={project.live}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Live: ${project.title}`}
            className="p-1.5 rounded border border-border text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors duration-200 cursor-pointer"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        )}
        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`GitHub: ${project.title}`}
            className="p-1.5 rounded border border-border text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors duration-200 cursor-pointer"
          >
            <Github className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>

    {/* Tech chips */}
    {project.tech.length > 0 && (
      <div className="flex flex-wrap gap-1.5 mt-auto">
        {project.tech.map((t, i) => (
          <span
            key={i}
            className="font-mono text-xs text-muted-foreground bg-secondary border border-border/50 px-2 py-0.5 rounded"
          >
            {t}
          </span>
        ))}
      </div>
    )}
  </div>
);

// ── Section ───────────────────────────────────────────────────────────────────
export const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestVersion, setRequestVersion] = useState(0);
  const [requestSource, setRequestSource] = useState<"network" | "cache" | "fallback">("network");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let active = true;

    const loadProjects = async () => {
      setLoading(true);

      const result = await fetchCollection<ProjectApiRow, Project>({
        cacheKey: "projects",
        mapItem: (project) => ({
          category: project.category ?? "Project",
          github: project.githubUrl ?? "",
          image: project.image ?? "",
          live: project.liveUrl ?? "",
          tech: Array.isArray(project.technologies) ? project.technologies : [],
          title: project.title ?? "Untitled project",
        }),
        url: apiClient.projects,
      });

      if (!active) return;

      setProjects(result.data);
      setRequestSource(result.source);
      setErrorMessage(result.errorMessage);
      setLoading(false);
    };

    void loadProjects();

    return () => {
      active = false;
    };
  }, [requestVersion]);

  useEffect(() => {
    if (loading || projects.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.from(".proj-heading", {
        scrollTrigger: { trigger: ".proj-heading", start: "top 88%", once: true },
        y: 24,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
      });
      gsap.from(".proj-card", {
        scrollTrigger: { trigger: ".proj-card", start: "top 90%", once: true },
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out",
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [loading, projects.length]);

  return (
    <section ref={sectionRef} className="py-24 px-6 relative z-10" id="projects">
      <div className="max-w-3xl mx-auto">
        <div className="proj-heading mb-10">
          <p className="text-xs font-mono text-primary tracking-widest uppercase mb-2">
            Projects
          </p>
          <h2 className="text-3xl font-bold text-foreground">Things I've Built</h2>
        </div>

        {!loading && requestSource !== "network" && (
          <ApiSectionNotice
            errorMessage={errorMessage}
            mode={requestSource === "cache" ? "cache" : "error"}
            onRetry={() => setRequestVersion((value) => value + 1)}
            sectionName="projects"
          />
        )}

        {loading ? (
          // 4 skeletons in the same 2-col grid — staggered pulse delay
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[0, 100, 200, 300].map((delay) => (
              <ProjectSkeleton key={delay} delay={delay} />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <p className="text-sm text-muted-foreground font-mono">
            {requestSource === "fallback"
              ? "Projects are temporarily unavailable."
              : "No projects found."}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {projects.map((p, i) => (
              <ProjectCard key={i} project={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
