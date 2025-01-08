import React from "react";
import { motion } from "framer-motion";
import { ParticleBackground } from "./ParticleBackground";
import { AnimatedTitle } from "./AnimatedTitle";
import { FloatingIcons } from "./FloatingIcons";
import { SocialLinks } from "./SocialLinks";
import { ScrollIndicator } from "./ScrollIndicator";

export const Hero = () => {
  const scrollToProjects = () => {
    const projectsSection = document.getElementById("projects");
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const roleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center p-8 overflow-hidden"
    >
      <ParticleBackground />
      <FloatingIcons />

      <div className="relative max-w-4xl mx-auto text-center z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div className="mb-6">
            <motion.span
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-block mb-4 text-2xl md:text-3xl text-gray-600 dark:text-gray-300"
            >
              Hi, I'm
            </motion.span>

            <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-3 text-4xl md:text-6xl font-extrabold tracking-tight">
              <AnimatedTitle
                text="Prashant Kumar Singh"
                className="bg-gradient-to-r from-primary-light to-blue-600 dark:from-primary-dark dark:to-blue-400 bg-clip-text text-transparent customclassfortitle"
              />
            </div>
          </motion.div>

          <motion.div
            variants={roleVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4 mb-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-xl md:text-2xl font-medium bg-gradient-to-r from-primary-light to-blue-600 dark:from-primary-dark dark:to-blue-400 bg-clip-text text-transparent"
            >
              Frontend Development Enthusiast
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="text-xl md:text-2xl font-medium bg-gradient-to-r from-blue-600 to-primary-light dark:from-blue-400 dark:to-primary-dark bg-clip-text text-transparent"
            >
              UI/UX Craftsman
            </motion.div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-2xl mx-auto"
          >
            Crafting beautiful, responsive, and user-friendly web experiences
            with modern technologies
          </motion.p>

          <SocialLinks />
          <ScrollIndicator onClick={scrollToProjects} />
        </motion.div>
      </div>
    </section>
  );
};
