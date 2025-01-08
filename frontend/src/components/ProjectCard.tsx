import React from "react";
import { motion } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";

interface ProjectCardProps {
  project: {
    title: string;
    image: string;
    tech: string[];
    github: string;
    live: string;
    category: string;
  };
  index: number;
  active: boolean;
  onClick: () => void;
}

// Helper function to ensure the live URL is absolute
const ensureAbsoluteUrl = (url: string) => {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`;
  }
  return url;
};

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  index,
  active,
  onClick,
}) => {
  return (
    <motion.div
      layout
      onClick={onClick}
      initial={false}
      animate={{
        scale: active ? 1 : 0.9,
        opacity: active ? 1 : 0.6,
        rotateY: active ? 0 : 5,
        zIndex: active ? 1 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      className={`relative cursor-pointer group ${
        active ? "w-[500px]" : "w-[280px]"
      } h-[400px] rounded-3xl overflow-hidden shrink-0`}
      style={{
        transformStyle: "preserve-3d",
        transformOrigin: "center center",
      }}
    >
      <motion.div className="absolute inset-0 bg-gradient-to-br from-primary-light/80 to-blue-600/80 dark:from-primary-dark/80 dark:to-blue-400/80 opacity-0 group-hover:opacity-90 transition-opacity duration-300 z-10" />

      <motion.img
        src={project.image}
        alt={project.title}
        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
      />

      <motion.div className="absolute inset-0 z-20 flex flex-col justify-center items-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="inline-block px-4 py-1 mb-4 text-sm font-medium text-white bg-white/20 rounded-full backdrop-blur-sm">
          {project.category}
        </span>
        <h3 className="text-2xl font-bold text-white mb-6">{project.title}</h3>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {project.tech.map((tech, i) => (
            <span
              key={i}
              className="px-3 py-1 text-sm text-white bg-white/20 rounded-full backdrop-blur-sm"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="flex justify-center space-x-4">
          <motion.a
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-white/10 rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors"
          >
            <Github className="w-6 h-6 text-white" />
          </motion.a>
          <motion.a
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            href={ensureAbsoluteUrl(project.live)} // Ensure absolute URL for liveUrl
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-white/10 rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors"
          >
            <ExternalLink className="w-6 h-6 text-white" />
          </motion.a>
        </div>
      </motion.div>
    </motion.div>
  );
};
