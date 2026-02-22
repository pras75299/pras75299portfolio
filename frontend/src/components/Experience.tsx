import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { apiClient } from "../utils/api";

interface ExperienceItem {
  title: string;
  company: string;
  period: string;
  description: string[];
  technologies: string[];
}

const ExperienceItemComponent = ({ exp, index }: { exp: ExperienceItem; index: number }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative pl-8 py-6 group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Timeline Line */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-border group-last:bottom-auto group-last:h-full" />
      
      {/* Timeline Dot */}
      <div 
        className={`absolute left-[-4px] top-8 w-2 h-2 rounded-full transition-colors duration-300 ${
          isHovered ? 'bg-primary' : 'bg-muted-foreground'
        }`}
      />

      <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4 mb-2">
        <h3 className={`text-xl font-display font-semibold transition-colors duration-300 ${
          isHovered ? 'text-primary' : 'text-foreground'
        }`}>
          {exp.title}
        </h3>
        <span className="text-muted-foreground font-mono text-sm">
          {exp.company} • {exp.period}
        </span>
      </div>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <ul className="space-y-2 mt-4 mb-6">
              {exp.description.map((item, i) => (
                <li key={i} className="text-muted-foreground text-sm flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-primary/50 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap gap-2 mt-4">
        {exp.technologies.map((tech, i) => (
          <span
            key={i}
            className="text-xs font-mono text-muted-foreground bg-secondary/50 px-2 py-1 rounded"
          >
            {tech}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

export const Experience = () => {
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const response = await axios.get(apiClient.experiences);
        const data = response.data.map((exp: any) => ({
          ...exp,
          period: `${new Date(exp.startDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
          })} - ${
            exp.current
              ? "Present"
              : new Date(exp.endDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                })
          }`,
        }));
        setExperiences(data);
      } catch (error) {
        console.error("Error fetching experiences:", error);
      }
    };

    fetchExperiences();
  }, []);

  return (
    <section className="py-32 px-6 relative z-10" id="experience">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-display font-bold mb-4">Experience</h2>
          <p className="text-muted-foreground">My professional journey so far.</p>
        </motion.div>

        <div className="space-y-4">
          {experiences.map((experience, index) => (
            <ExperienceItemComponent key={index} exp={experience} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
