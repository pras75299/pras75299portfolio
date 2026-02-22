import React from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, Twitter, ArrowRight } from "lucide-react";

export const Hero = () => {
  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center pt-20 pb-16 px-6"
    >
      <div className="max-w-3xl mx-auto w-full space-y-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-mono mb-4">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>Available for work</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter">
            Prashant <br />
            <span className="text-muted-foreground">Kumar Singh</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl font-display mt-6 leading-relaxed">
            Frontend Development Enthusiast crafting beautiful, responsive, and user-friendly web experiences with modern technologies.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap items-center gap-4 pt-4"
        >
          <a
            href="https://github.com/pras75299"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors group px-4 py-2 bg-secondary/50 rounded-lg hover:bg-secondary"
          >
            <Github className="w-5 h-5" />
            <span>GitHub</span>
          </a>
          
          <a
            href="https://www.linkedin.com/in/wordsprashant/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors group px-4 py-2 bg-secondary/50 rounded-lg hover:bg-secondary"
          >
            <Linkedin className="w-5 h-5" />
            <span>LinkedIn</span>
          </a>
          
          <a
            href="https://x.com/asNobodyLikes"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors group px-4 py-2 bg-secondary/50 rounded-lg hover:bg-secondary"
          >
            <Twitter className="w-5 h-5" />
            <span>Twitter</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

