import React from 'react';
import { motion } from 'framer-motion';
import { Code, Laptop, Palette, Terminal } from 'lucide-react';

export const FloatingIcons = () => {
  const icons = [
    { Icon: Code, delay: 0 },
    { Icon: Laptop, delay: 0.2 },
    { Icon: Palette, delay: 0.4 },
    { Icon: Terminal, delay: 0.6 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {icons.map(({ Icon, delay }, index) => (
        <motion.div
          key={index}
          className="absolute"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 1, 0],
            x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
            y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
          }}
          transition={{
            duration: 8,
            delay,
            repeat: Infinity,
            repeatType: "loop",
          }}
        >
          <Icon className="w-8 h-8 text-primary-light/20 dark:text-primary-dark/20" />
        </motion.div>
      ))}
    </div>
  );
};