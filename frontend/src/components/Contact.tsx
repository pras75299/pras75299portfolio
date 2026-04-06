import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Mail, ArrowUpRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export const Contact = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".ct-inner > *", {
        scrollTrigger: { trigger: ".ct-inner", start: "top 85%", once: true },
        y: 24,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-6 relative z-10" id="contact">
      <div className="max-w-3xl mx-auto">
        <div className="ct-inner bg-card border border-border rounded-xl p-8 md:p-12">
          <p className="text-xs font-mono text-primary tracking-widest uppercase mb-4">
            Contact
          </p>

          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
            Ready to build something great?
          </h2>

          <p className="text-muted-foreground text-base mb-8 max-w-md leading-relaxed">
            I'm open to new opportunities, collaborations, and interesting
            projects. Drop me a line and let's talk.
          </p>

          {/* Email — displayed prominently */}
          <a
            href="mailto:prashantsingh11294@gmail.com"
            className="group flex items-center gap-2 text-foreground font-medium text-base sm:text-lg hover:text-primary transition-colors duration-200 cursor-pointer mb-6"
          >
            <Mail className="w-4 h-4 text-primary shrink-0" />
            prashantsingh11294@gmail.com
            <ArrowUpRight className="w-4 h-4 opacity-0 -translate-y-0.5 translate-x-[-4px] group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-200" />
          </a>

          {/* Secondary CTA button */}
          <a
            href="mailto:prashantsingh11294@gmail.com"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity duration-200 cursor-pointer"
          >
            Send a message
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};
