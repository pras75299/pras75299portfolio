import React from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, Twitter } from "lucide-react";

export const SocialLinks = () => {
  const socialLinks = [
    { Icon: Github, href: "https://github.com/pras75299", label: "GitHub" },
    {
      Icon: Linkedin,
      href: "https://www.linkedin.com/in/wordsprashant/",
      label: "LinkedIn",
    },
    { Icon: Twitter, href: "https://x.com/asNobodyLikes", label: "Twitter" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="flex justify-center space-x-6 mb-12"
    >
      {socialLinks.map(({ Icon, href, label }, index) => (
        <motion.a
          key={index}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{
            scale: 1.2,
            rotate: 360,
            transition: { duration: 0.5 },
          }}
          whileTap={{ scale: 0.9 }}
          className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Icon className="w-6 h-6 text-primary-light dark:text-primary-dark" />
          <span className="sr-only">{label}</span>
        </motion.a>
      ))}
    </motion.div>
  );
};
