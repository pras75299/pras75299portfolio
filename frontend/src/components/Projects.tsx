import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Code, Globe, Layers } from 'lucide-react';
import { ProjectCard } from './ProjectCard';

const projects = [
  {
    title: "Modern E-commerce Platform",
    image: "https://images.unsplash.com/photo-1661956602116-aa6865609028?auto=format&fit=crop&w=1400&q=80",
    tech: ["React", "TypeScript", "Node.js", "Stripe"],
    github: "https://github.com",
    live: "https://example.com",
    category: "Full Stack"
  },
  {
    title: "AI-Powered Analytics Dashboard",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80",
    tech: ["Next.js", "TensorFlow.js", "D3.js"],
    github: "https://github.com",
    live: "https://example.com",
    category: "Frontend"
  },
  {
    title: "Social Media Platform",
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1400&q=80",
    tech: ["React", "GraphQL", "WebSocket"],
    github: "https://github.com",
    live: "https://example.com",
    category: "Full Stack"
  },
  {
    title: "Smart Home IoT Dashboard",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1400&q=80",
    tech: ["Vue.js", "MQTT", "Node-RED", "WebSocket"],
    github: "https://github.com",
    live: "https://example.com",
    category: "IoT"
  },
  {
    title: "Blockchain Explorer",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1400&q=80",
    tech: ["React", "Web3.js", "Ethers.js", "TypeScript"],
    github: "https://github.com",
    live: "https://example.com",
    category: "Web3"
  },
  {
    title: "AI Image Generator",
    image: "https://images.unsplash.com/photo-1686191128892-3261ef360667?auto=format&fit=crop&w=1400&q=80",
    tech: ["Next.js", "OpenAI API", "TailwindCSS"],
    github: "https://github.com",
    live: "https://example.com",
    category: "AI/ML"
  }
];

export const Projects = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [activeIndex, setActiveIndex] = useState(0);

  const stats = [
    { icon: Code, value: "50+", label: "Projects Completed" },
    { icon: Globe, value: "30+", label: "Happy Clients" },
    { icon: Layers, value: "5+", label: "Years Experience" }
  ];

  const visibleProjects = projects.slice(
    Math.max(0, activeIndex - 2),
    Math.min(projects.length, activeIndex + 3)
  );

  return (
    <section className="py-20 bg-background-light dark:bg-background-dark overflow-hidden" id="projects">
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
              Explore some of my recent work that showcases my expertise in building modern, responsive, and user-friendly applications.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 mb-16"
          >
            {stats.map(({ icon: Icon, value, label }, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm"
              >
                <div className="flex flex-col items-center">
                  <Icon className="w-8 h-8 mb-3 text-primary-light dark:text-primary-dark" />
                  <span className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</span>
                  <span className="text-gray-600 dark:text-gray-300">{label}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <div className="relative">
          <motion.div
            className="flex justify-center items-center min-h-[500px] perspective-1000 px-4"
          >
            <div className="relative flex justify-center items-center gap-4 max-w-full">
              {visibleProjects.map((project, index) => (
                <ProjectCard
                  key={index + Math.max(0, activeIndex - 2)}
                  project={project}
                  index={index}
                  active={index + Math.max(0, activeIndex - 2) === activeIndex}
                  onClick={() => setActiveIndex(index + Math.max(0, activeIndex - 2))}
                />
              ))}
            </div>
          </motion.div>
          
          <div className="flex justify-center mt-8 gap-2">
            {projects.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? 'bg-primary-light dark:bg-primary-dark w-6'
                    : 'bg-gray-300 dark:bg-gray-700'
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