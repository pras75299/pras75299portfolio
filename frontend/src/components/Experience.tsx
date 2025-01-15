import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Briefcase, Calendar } from "lucide-react";
import axios from "axios";

interface ExperienceItem {
  title: string;
  company: string;
  period: string;
  description: string[];
  technologies: string[];
}

const ExperienceCard: React.FC<{
  experience: ExperienceItem;
  index: number;
}> = ({ experience, index }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      className="relative pl-8 pb-8"
    >
      <div className="absolute left-[7px] top-2 bottom-0 w-[2px] bg-gray-200 dark:bg-gray-700" />
      <div className="absolute left-0 top-2 w-4 h-4 rounded-full bg-primary-light dark:bg-primary-dark" />
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {experience.title}
          </h3>
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="text-sm">{experience.period}</span>
          </div>
        </div>

        <div className="flex items-center text-primary-light dark:text-primary-dark mb-4">
          <Briefcase className="w-4 h-4 mr-2" />
          <span className="font-medium">{experience.company}</span>
        </div>

        <ul className="mb-4 space-y-2">
          {experience.description.map((item, i) => (
            <li key={i} className="text-gray-600 dark:text-gray-300 text-sm">
              • {item}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-2">
          {experience.technologies.map((tech, i) => (
            <span
              key={i}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-full text-gray-700 dark:text-gray-300"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export const Experience = () => {
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const response = await axios.get(
          "https://pras75299portfolio.vercel.app/api/experiences"
        );
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
    <section className="py-20 bg-gray-50 dark:bg-gray-900" id="experience">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary-light to-blue-600 dark:from-primary-dark dark:to-blue-400 bg-clip-text text-transparent">
            Professional Experience
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            A timeline of my professional journey and achievements
          </p>
        </motion.div>

        <div className="relative">
          {experiences.map((experience, index) => (
            <ExperienceCard key={index} experience={experience} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
