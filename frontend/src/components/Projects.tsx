import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Github } from "lucide-react";
import axios from "axios";
import { apiClient } from "../utils/api";

interface Project {
  title: string;
  image: string;
  tech: string[];
  github: string;
  live: string;
  category: string;
}

export const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(apiClient.projects);
        const rows = Array.isArray(response.data) ? response.data : [];
        const mappedProjects = rows.map((project: any) => ({
          title: project.title,
          image: project.image,
          tech: Array.isArray(project.technologies) ? project.technologies : [],
          github: project.githubUrl,
          live: project.liveUrl,
          category: project.category,
        }));
        setProjects(mappedProjects);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <section className="py-32 px-6 relative z-10" id="projects">
        <div className="max-w-3xl mx-auto">
          <p className="text-muted-foreground font-mono">Loading projects...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-32 px-6 relative z-10" id="projects">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-display font-bold mb-4">Projects</h2>
          <p className="text-muted-foreground">Some of my recent work.</p>
        </motion.div>

        <div className="space-y-12">
          {projects.length === 0 && (
            <p className="text-muted-foreground font-mono text-sm">
              No projects loaded. Check DevTools → Network for{" "}
              <code className="text-xs">/api/projects</code>.
            </p>
          )}
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="block border-b border-border pb-8 hover:border-primary transition-colors">
                <div className="flex flex-col sm:flex-row justify-between sm:items-baseline mb-4 gap-2">
                  <div className="flex items-center gap-3">
                    <a
                      href={project.live || project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-2xl font-display font-bold group-hover:text-primary transition-colors flex items-center gap-2"
                    >
                      {project.title}
                      <ArrowUpRight className="w-5 h-5 opacity-0 -translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all" />
                    </a>
                    <div className="flex items-center gap-2">
                      {project.live && (
                        <a
                          href={project.live}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open live site for ${project.title}`}
                          className="rounded-full border border-border bg-secondary/40 p-2 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </a>
                      )}
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open GitHub repository for ${project.title}`}
                          className="rounded-full border border-border bg-secondary/40 p-2 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <Github className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">{project.category}</span>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  {project.tech.map((tech, i) => (
                    <span
                      key={i}
                      className="text-xs font-mono text-muted-foreground bg-secondary/50 px-2 py-1 rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
