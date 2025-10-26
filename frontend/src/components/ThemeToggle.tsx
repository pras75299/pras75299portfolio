import React, { useRef } from "react";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { flushSync } from "react-dom";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleToggle = async () => {
    // Check if View Transition API is supported
    if (
      !buttonRef.current ||
      !document.startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      toggleTheme();
      return;
    }

    // Get the button position before the transition
    const { top, left, width, height } =
      buttonRef.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const right = window.innerWidth - left;
    const bottom = window.innerHeight - top;

    // Calculate the radius needed to cover the screen
    const maxRadius = Math.hypot(Math.max(left, right), Math.max(top, bottom));

    // Add a buffer to ensure full coverage
    const radiusWithBuffer = maxRadius + 100;

    // Start the view transition
    const transition = document.startViewTransition(() => {
      flushSync(() => {
        toggleTheme();
      });
    });

    // Wait for the transition to be ready
    await transition.ready;

    // Animate the new view expanding from the button position
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${radiusWithBuffer}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 500,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      }
    );

    // Animate the old view shrinking from full circle to nothing
    document.documentElement.animate(
      {
        clipPath: [
          `circle(${radiusWithBuffer}px at ${x}px ${y}px)`,
          `circle(0px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 500,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-old(root)",
      }
    );
  };

  return (
    <motion.button
      ref={buttonRef}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleToggle}
      className="p-2 rounded-full bg-opacity-20 hover:bg-opacity-30 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </motion.button>
  );
};
