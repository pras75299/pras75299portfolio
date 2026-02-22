import { motion } from "framer-motion";
import { GitHubCalendar } from "react-github-calendar";

export const GithubContributions = () => {
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
          <h2 className="text-3xl font-display font-bold mb-4">Code Contributions</h2>
          <p className="text-muted-foreground">My GitHub commit history and activity.</p>
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
              blockSize={14}
              blockMargin={6}
              fontSize={14}
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
