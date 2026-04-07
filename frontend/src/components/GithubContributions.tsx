import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GitHubCalendar } from "react-github-calendar";

gsap.registerPlugin(ScrollTrigger);

// A full-year calendar renders ~53 week columns.
// Each cell occupies (blockSize + blockMargin) px of width.
// ~30 px extra for the day-of-week labels on the left side.
// So: blockSize = floor((availableWidth - 30) / 53) - blockMargin
const BLOCK_MARGIN = 3;
const MIN_BLOCK = 10;
const MAX_BLOCK = 12;

export const GithubContributions = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [blockSize, setBlockSize] = useState(10);

  // Compute the right blockSize from the card's actual inner width.
  const calcBlockSize = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;

    const style = window.getComputedStyle(card);
    const padLeft = parseFloat(style.paddingLeft);
    const padRight = parseFloat(style.paddingRight);
    const available = card.clientWidth - padLeft - padRight;

    const computed = Math.floor((available - 30) / 53) - BLOCK_MARGIN;
    setBlockSize(Math.max(MIN_BLOCK, Math.min(computed, MAX_BLOCK)));
  }, []);

  // Recalculate whenever the card resizes (handles initial load + window resize).
  useEffect(() => {
    calcBlockSize();

    const ro = new ResizeObserver(calcBlockSize);
    if (cardRef.current) ro.observe(cardRef.current);
    return () => ro.disconnect();
  }, [calcBlockSize]);

  // GSAP scroll entrance.
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".gc-inner > *", {
        scrollTrigger: { trigger: ".gc-inner", start: "top 88%", once: true },
        y: 20,
        opacity: 0,
        duration: 0.55,
        stagger: 0.1,
        ease: "power2.out",
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const fontSize = blockSize <= 10 ? 12 : 14;

  return (
    <section
      ref={sectionRef}
      className="py-24 px-6 relative z-10"
      id="contributions"
    >
      <div className="max-w-3xl mx-auto">
        <div className="gc-inner">
          <div className="mb-8">
            <p className="text-xs font-mono text-primary tracking-widest uppercase mb-2">
              Activity
            </p>
            <h2 className="text-3xl font-bold text-foreground">
              GitHub Contributions
            </h2>
          </div>

          {/* No overflow-x-auto — blockSize is calculated to fit exactly */}
          <div
            ref={cardRef}
            className="bg-card border border-border rounded-lg p-4 md:p-6"
          >
            <GitHubCalendar
              username="pras75299"
              blockSize={blockSize}
              blockMargin={BLOCK_MARGIN}
              fontSize={fontSize}
              theme={{
                light: [
                  "hsl(var(--secondary))",
                  "hsl(var(--primary) / 0.3)",
                  "hsl(var(--primary) / 0.5)",
                  "hsl(var(--primary) / 0.75)",
                  "hsl(var(--primary))",
                ],
                dark: [
                  "hsl(var(--secondary))",
                  "hsl(var(--primary) / 0.3)",
                  "hsl(var(--primary) / 0.5)",
                  "hsl(var(--primary) / 0.75)",
                  "hsl(var(--primary))",
                ],
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
