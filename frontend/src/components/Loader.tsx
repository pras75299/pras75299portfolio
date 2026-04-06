import { useEffect, useRef } from "react";
import gsap from "gsap";

interface LoaderProps {
  onComplete: () => void;
}

const Loader = ({ onComplete }: LoaderProps) => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".ld-name", { y: 32, opacity: 0, duration: 0.7 })
        .from(
          ".ld-bar",
          {
            scaleX: 0,
            duration: 0.75,
            ease: "power2.inOut",
            transformOrigin: "left center",
          },
          "-=0.35"
        )
        .to(
          ".ld-inner",
          {
            y: -24,
            opacity: 0,
            duration: 0.45,
            ease: "power2.in",
            delay: 0.3,
          }
        )
        .to(
          rootRef.current,
          { opacity: 0, duration: 0.35, ease: "power1.in", onComplete },
          "-=0.1"
        );
    }, rootRef);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
    >
      <div className="ld-inner text-center px-6">
        <p className="ld-name font-mono text-xs text-primary tracking-[0.3em] uppercase mb-5">
          Prashant Kumar Singh
        </p>
        <h1 className="ld-name text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-5">
          Full Stack &amp; Rust Engineer
        </h1>
        <div className="ld-bar h-[1.5px] w-full bg-primary rounded-full" />
      </div>
    </div>
  );
};

export default Loader;
