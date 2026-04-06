import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, Github } from "lucide-react";
import axios from "axios";
import { apiClient } from "../utils/api";

gsap.registerPlugin(ScrollTrigger);

interface Project {
  title: string;
  image: string;
  tech: string[];
  github: string;
  live: string;
  category: string;
}

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

export const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(apiClient.projects);
        const rows = Array.isArray(res.data) ? res.data : [];
        setProjects(
          rows.map((p: any) => ({
            title: p.title,
            image: p.image,
            tech: Array.isArray(p.technologies) ? p.technologies : [],
            github: p.githubUrl,
            live: p.liveUrl,
            category: p.category,
          }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      gsap.from(".proj-heading", {
        scrollTrigger: { trigger: ".proj-heading", start: "top 88%", once: true },
        y: 24, opacity: 0, duration: 0.6, ease: "power3.out",
      });
      gsap.from(".proj-card", {
        scrollTrigger: { trigger: ".proj-card", start: "top 90%", once: true },
        y: 20, opacity: 0, duration: 0.5, stagger: 0.08, ease: "power2.out",
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [loading]);

  return (
    <section ref={sectionRef} className="py-24 px-6 relative z-10" id="projects">
      <div className="max-w-3xl mx-auto">
        <div className="proj-heading mb-10">
          <p className="text-xs font-mono text-primary tracking-widest uppercase mb-2">
            Projects
          </p>
          <h2 className="text-3xl font-bold text-foreground">Things I've Built</h2>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground font-mono">Loading projects…</p>
        ) : projects.length === 0 ? (
          <p className="text-sm text-muted-foreground font-mono">
            No projects found — check <code className="text-primary">/api/projects</code>.
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
