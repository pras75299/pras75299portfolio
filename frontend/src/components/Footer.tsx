import { Github, Linkedin, Twitter } from "lucide-react";

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border py-8 px-6 relative z-10">
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs font-mono text-muted-foreground">
          © {year} Prashant Kumar Singh
        </p>

        <div className="flex items-center gap-4">
          {[
            { href: "https://github.com/pras75299",              icon: Github,   label: "GitHub"   },
            { href: "https://www.linkedin.com/in/wordsprashant/", icon: Linkedin, label: "LinkedIn" },
            { href: "https://x.com/asNobodyLikes",                icon: Twitter,  label: "Twitter"  },
          ].map(({ href, icon: Icon, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer"
            >
              <Icon className="w-4 h-4" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};
