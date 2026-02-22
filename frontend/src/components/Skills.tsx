import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { apiClient } from "../utils/api";

interface Technology {
  name: string;
  icon: string;
}

export const Skills = () => {
  const [technologies, setTechnologies] = useState<Technology[]>([]);

  useEffect(() => {
    const fetchTechnologies = async () => {
      try {
        const response = await axios.get(apiClient.skills);
        setTechnologies(response.data);
      } catch (error) {
        console.error("Error fetching skills:", error);
      }
    };

    fetchTechnologies();
  }, []);

  return (
    <section className="py-32 px-6 relative z-10" id="skills">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-display font-bold mb-4">Skills</h2>
          <p className="text-muted-foreground">Technologies I work with.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap items-center gap-4 md:gap-6"
        >
          {technologies.map((tech, index) => (
            <React.Fragment key={index}>
              <motion.div
                whileHover={{ scale: 1.05, color: "var(--primary)" }}
                className="text-lg md:text-xl font-medium text-foreground transition-colors cursor-default"
              >
                {tech.name}
              </motion.div>
              {index < technologies.length - 1 && (
                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              )}
            </React.Fragment>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
