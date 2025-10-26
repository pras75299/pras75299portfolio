import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ProjectCard } from "./ProjectCard";
import axios from "axios";

export const Projects = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [projects, setProjects] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get("/api/projects");
        const mappedProjects = response.data.map(
          (project: {
            title: any;
            image: any;
            technologies: any;
            githubUrl: any;
            liveUrl: any;
            category: any;
          }) => ({
            title: project.title,
            image: project.image,
            tech: project.technologies,
            github: project.githubUrl,
            live: project.liveUrl,
            category: project.category,
          })
        );
        setProjects(mappedProjects);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const visibleProjects = projects.slice(
    Math.max(0, activeIndex - 2),
    Math.min(projects.length, activeIndex + 3)
  );

  if (loading) {
    return (
      <section
        className="py-20 bg-background-light dark:bg-background-dark overflow-hidden"
        id="projects"
      >
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>Loading projects...</p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-20 bg-background-light dark:bg-background-dark overflow-hidden"
      id="projects"
    >
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary-light to-blue-600 dark:from-primary-dark dark:to-blue-400 bg-clip-text text-transparent">
              Featured Projects
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Explore some of my recent work that showcases my expertise in
              building modern, responsive, and user-friendly applications.
            </p>
          </motion.div>
        </motion.div>

        <div className="relative">
          <motion.div className="flex justify-center items-center min-h-[500px] perspective-1000 px-4">
            <div className="relative flex flex-col md:flex-row justify-center items-center gap-4 max-w-full w-full">
              {visibleProjects.map((project, index) => (
                <div
                  key={index + Math.max(0, activeIndex - 2)}
                  className="w-full md:w-auto"
                >
                  <ProjectCard
                    project={project}
                    index={index}
                    active={
                      index + Math.max(0, activeIndex - 2) === activeIndex
                    }
                    onClick={() =>
                      setActiveIndex(index + Math.max(0, activeIndex - 2))
                    }
                  />
                </div>
              ))}
            </div>
          </motion.div>

          <div className="hidden md:flex justify-center mt-8 gap-2">
            {projects.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? "bg-primary-light dark:bg-primary-dark w-6"
                    : "bg-gray-300 dark:bg-gray-700"
                }`}
                aria-label={`Go to project ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
