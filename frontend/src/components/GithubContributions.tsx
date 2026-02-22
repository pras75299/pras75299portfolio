import { motion } from "framer-motion";
import { GitHubCalendar } from "react-github-calendar";
import { useState, useEffect } from "react";

export const GithubContributions = () => {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Dynamically shrink the graph blocks on small mobile screens
  const isMobile = windowWidth < 640;
  const blockSize = isMobile ? 8 : 12;
  const blockMargin = isMobile ? 2 : 3;
  const fontSize = isMobile ? 10 : 12;

  return (
    <section className="py-20 px-6 relative z-10" id="contributions">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-display font-bold mb-2">Code Contributions</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-card/30 border border-border rounded-xl p-6 md:p-8 backdrop-blur-sm shadow-xl flex justify-center text-sm md:text-base overflow-x-auto"
        >
          <div className="min-w-fit">
            <GitHubCalendar 
              username="pras75299" 
              blockSize={blockSize}
              blockMargin={blockMargin}
              fontSize={fontSize}
              theme={{
                light: ['hsl(var(--muted))', 'hsl(var(--primary) / 0.4)', 'hsl(var(--primary) / 0.6)', 'hsl(var(--primary) / 0.8)', 'hsl(var(--primary))'],
                dark: ['hsl(var(--muted))', 'hsl(var(--primary) / 0.4)', 'hsl(var(--primary) / 0.6)', 'hsl(var(--primary) / 0.8)', 'hsl(var(--primary))'],
              }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};
