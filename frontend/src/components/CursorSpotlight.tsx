import { useEffect, useRef } from "react";
import gsap from "gsap";

const CursorSpotlight = () => {
  const spotRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const visible = useRef(false);

  useEffect(() => {
    const el = spotRef.current;
    if (!el) return;

    // Start invisible
    gsap.set(el, { opacity: 0 });

    const onMouseMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };

      if (!visible.current) {
        visible.current = true;
        gsap.to(el, { opacity: 1, duration: 0.4, ease: "power2.out" });
      }

      // Smooth follow with GSAP quickSetter
      gsap.to(el, {
        "--spot-x": e.clientX + "px",
        "--spot-y": e.clientY + "px",
        duration: 0.55,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const onMouseLeave = () => {
      visible.current = false;
      gsap.to(el, { opacity: 0, duration: 0.4, ease: "power2.in" });
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.body.addEventListener("mouseleave", onMouseLeave);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.body.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <div
      ref={spotRef}
      className="pointer-events-none fixed inset-0 z-30"
      style={
        {
          "--spot-x": "50%",
          "--spot-y": "50%",
          background:
            "radial-gradient(600px circle at var(--spot-x) var(--spot-y), hsl(var(--primary) / 0.055), transparent 40%)",
        } as React.CSSProperties
      }
    />
  );
};

export default CursorSpotlight;
