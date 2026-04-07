import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Github, Linkedin, Twitter } from "lucide-react";

export const Hero = () => {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        delay: 0.1,
      });

      tl.from(".h-badge", { y: 14, opacity: 0, duration: 0.5 })
        .from(".h-name", { y: 40, opacity: 0, duration: 0.75 }, "-=0.2")
        .from(".h-role", { y: 20, opacity: 0, duration: 0.5 }, "-=0.4")
        .from(".h-desc", { y: 16, opacity: 0, duration: 0.5 }, "-=0.3")
        .from(
          ".h-cta",
          { y: 14, opacity: 0, duration: 0.45, stagger: 0.07 },
          "-=0.25",
        )
        .from(
          ".h-stat",
          { y: 12, opacity: 0, duration: 0.4, stagger: 0.06 },
          "-=0.2",
        );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="home"
      ref={rootRef}
      className="min-h-screen flex items-center pt-28 pb-16 px-6"
    >
      <div className="max-w-3xl mx-auto w-full">
        {/* Available badge */}
        <div className="h-badge inline-flex items-center gap-2 text-xs font-medium text-primary border border-primary/25 bg-primary/8 px-3 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Available for work
        </div>

        {/* Name */}
        <h1 className="h-name text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05] text-foreground mb-4">
          Prashant Kumar Singh
        </h1>

        {/* Role */}
        <p className="h-role text-lg sm:text-xl font-medium text-muted-foreground mb-6">
          Full Stack &amp; Rust Engineer
        </p>

        {/* Description */}
        <p className="h-desc text-base text-muted-foreground leading-relaxed max-w-lg mb-10">
          Building scalable full-stack applications and high-performance backend
          systems with Rust, Node.js, and modern web architecture.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-wrap items-center gap-3 mb-10">
          <a
            href="https://github.com/pras75299"
            target="_blank"
            rel="noopener noreferrer"
            className="h-cta inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-secondary border border-border text-sm font-medium text-foreground hover:border-primary/50 hover:text-primary transition-colors duration-200 cursor-pointer"
          >
            <Github className="w-4 h-4" />
            GitHub
          </a>

          <a
            href="https://www.linkedin.com/in/wordsprashant/"
            target="_blank"
            rel="noopener noreferrer"
            className="h-cta inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-secondary border border-border text-sm font-medium text-foreground hover:border-primary/50 hover:text-primary transition-colors duration-200 cursor-pointer"
          >
            <Linkedin className="w-4 h-4" />
            LinkedIn
          </a>

          <a
            href="https://x.com/asNobodyLikes"
            target="_blank"
            rel="noopener noreferrer"
            className="h-cta inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-secondary border border-border text-sm font-medium text-foreground hover:border-primary/50 hover:text-primary transition-colors duration-200 cursor-pointer"
          >
            <Twitter className="w-4 h-4" />
            Twitter
          </a>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-6">
          <div className="h-stat">
            <span className="block text-2xl font-bold text-foreground">
              10+
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              Years experience
            </span>
          </div>
          <div className="h-stat w-px h-10 bg-border" />
          <div className="h-stat">
            <span className="block text-2xl font-bold text-foreground">
              50+
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              Projects shipped
            </span>
          </div>
          <div className="h-stat w-px h-10 bg-border" />
          <div className="h-stat">
            <span className="block text-2xl font-bold text-foreground">∞</span>
            <span className="text-xs text-muted-foreground font-medium">
              Coffees consumed
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
