import React from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Twitter } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-8 px-6 mt-20 border-t border-white/5 relative z-10 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-muted-foreground text-sm font-mono">
          © {currentYear} Prashant Kumar Singh. All rights reserved.
        </p>
        
        <div className="flex gap-4">
          <motion.a
            href="https://github.com/pras75299"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1, color: "var(--foreground)" }}
            whileTap={{ scale: 0.95 }}
            className="text-muted-foreground transition-colors"
          >
            <Github className="w-5 h-5" />
            <span className="sr-only">GitHub</span>
          </motion.a>
          
          <motion.a
            href="https://www.linkedin.com/in/wordsprashant/"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1, color: "var(--primary)" }}
            whileTap={{ scale: 0.95 }}
            className="text-muted-foreground transition-colors"
          >
            <Linkedin className="w-5 h-5" />
            <span className="sr-only">LinkedIn</span>
          </motion.a>
          
          <motion.a
            href="https://x.com/asNobodyLikes"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1, color: "var(--foreground)" }}
            whileTap={{ scale: 0.95 }}
            className="text-muted-foreground transition-colors"
          >
            <Twitter className="w-5 h-5" />
            <span className="sr-only">Twitter</span>
          </motion.a>
        </div>
      </div>
    </footer>
  );
};
