import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import axios from "axios";
import { apiClient } from "../utils/api";
interface Technology {
  name: string;
  icon: string;
}

const TechnologyCard: React.FC<{ technology: Technology; index: number }> = ({
  technology,
  index,
}) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <motion.img
        src={technology.icon}
        alt={technology.name}
        className="w-12 h-12 mb-3"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: index * 0.1 + 0.2,
        }}
      />
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {technology.name}
      </span>
    </motion.div>
  );
};

export const Skills = () => {
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

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
    <section className="py-20 bg-gray-50 dark:bg-gray-900" id="skills">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary-light to-blue-600 dark:from-primary-dark dark:to-blue-400 bg-clip-text text-transparent">
            Technical Expertise
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Technologies and tools I work with
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {technologies.map((technology, index) => (
            <TechnologyCard key={index} technology={technology} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
