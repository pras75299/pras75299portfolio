import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export const Contact = () => {
  return (
    <section className="py-32 px-6 relative z-10" id="contact">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-xl"
        >
          <h2 className="text-5xl md:text-6xl font-display font-bold mb-8">
            Ready to work together? Let's talk.
          </h2>
          
          <a
            href="mailto:prashantsingh11294@gmail.com"
            className="inline-flex items-center gap-2 text-xl font-mono text-muted-foreground hover:text-primary transition-colors group"
          >
            prashantsingh11294@gmail.com
            <ArrowUpRight className="w-6 h-6 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};
