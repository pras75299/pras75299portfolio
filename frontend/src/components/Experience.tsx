import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Briefcase, Calendar } from 'lucide-react';

interface ExperienceItem {
  title: string;
  company: string;
  period: string;
  description: string[];
  technologies: string[];
}

const experiences: ExperienceItem[] = [
  {
    title: "Senior Frontend Developer",
    company: "Tech Innovators Inc.",
    period: "2022 - Present",
    description: [
      "Led the development of a next-generation SaaS platform",
      "Improved application performance by 40%",
      "Mentored junior developers and conducted code reviews"
    ],
    technologies: ["React", "TypeScript", "Next.js", "GraphQL"]
  },
  {
    title: "Full Stack Developer",
    company: "Digital Solutions Ltd",
    period: "2020 - 2022",
    description: [
      "Developed and maintained multiple client projects",
      "Implemented CI/CD pipelines",
      "Reduced server response time by 60%"
    ],
    technologies: ["React", "Node.js", "PostgreSQL", "Docker"]
  },
  {
    title: "Frontend Developer",
    company: "Creative Web Agency",
    period: "2018 - 2020",
    description: [
      "Built responsive web applications",
      "Collaborated with designers to implement pixel-perfect UIs",
      "Optimized website performance and SEO"
    ],
    technologies: ["React", "JavaScript", "SASS", "Webpack"]
  }
];

const ExperienceCard: React.FC<{ experience: ExperienceItem; index: number }> = ({ experience, index }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      className="relative pl-8 pb-8"
    >
      {/* Timeline line */}
      <div className="absolute left-[7px] top-2 bottom-0 w-[2px] bg-gray-200 dark:bg-gray-700" />
      
      {/* Timeline dot */}
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
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

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
            <ExperienceCard
              key={index}
              experience={experience}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};