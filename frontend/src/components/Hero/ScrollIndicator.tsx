import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface ScrollIndicatorProps {
  onClick: () => void;
}

export const ScrollIndicator = ({ onClick }: ScrollIndicatorProps) => {
  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2 }}
      onClick={onClick}
      className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center cursor-pointer group"
    >
      <motion.div
        animate={{
          y: [0, 10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className="text-gray-500 dark:text-gray-400 group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors"
      >
        <span className="block mb-2 text-sm font-medium">Scroll to explore</span>
        <ChevronDown className="w-6 h-6 mx-auto" />
      </motion.div>
    </motion.button>
  );
};