import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Menu } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { MobileMenu } from "./MobileMenu";

const navItems = [
  { name: "Home",       href: "#home" },
  { name: "Experience", href: "#experience" },
  { name: "Projects",   href: "#projects" },
  { name: "Skills",     href: "#skills" },
];

export const Navbar = () => {
  const [activeSection, setActiveSection]   = useState("Home");
  const [isScrolled, setIsScrolled]         = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerRef   = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  /* entrance */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        y: -64,
        opacity: 0,
        duration: 0.65,
        ease: "power3.out",
        delay: 0.1,
      });
    });
    return () => ctx.revert();
  }, []);

  /* scroll spy */
  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 20);
      const mid = window.scrollY + window.innerHeight / 2;
      let current = "Home";
      document.querySelectorAll<HTMLElement>("section[id]").forEach((s) => {
        if (mid >= s.offsetTop && mid < s.offsetTop + s.clientHeight) {
          current = s.id.charAt(0).toUpperCase() + s.id.slice(1);
        }
      });
      setActiveSection(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* sliding indicator */
  useEffect(() => {
    const active = document.querySelector<HTMLElement>(`[data-nav="${activeSection}"]`);
    const bar    = indicatorRef.current;
    if (!active || !bar) return;
    const nav  = active.closest("nav")!;
    const rect = active.getBoundingClientRect();
    const pRect = nav.getBoundingClientRect();
    gsap.to(bar, {
      x: rect.left - pRect.left,
      width: rect.width,
      duration: 0.3,
      ease: "power2.out",
    });
  }, [activeSection]);

  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* Floating navbar — spaced from all edges */}
      <header
        ref={headerRef}
        className="fixed top-4 left-4 right-4 z-50"
      >
        <div
          className={`max-w-3xl mx-auto rounded-xl border transition-all duration-300 ${
            isScrolled
              ? "bg-background/95 backdrop-blur-xl border-border shadow-lg shadow-black/20"
              : "bg-background/70 backdrop-blur-md border-border/50"
          }`}
        >
          <div className="px-5 h-14 flex items-center justify-between">
            {/* Logo */}
            <a
              href="#home"
              onClick={(e) => { e.preventDefault(); scrollTo("#home"); }}
              className="text-sm font-bold text-foreground hover:text-primary transition-colors duration-200 cursor-pointer tracking-tight"
            >
              PKS<span className="text-primary">.</span>
            </a>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-5 relative">
              {/* Sliding bottom indicator */}
              <div
                ref={indicatorRef}
                className="absolute -bottom-[2px] h-[2px] bg-primary rounded-full pointer-events-none"
                style={{ width: 0 }}
              />
              {navItems.map((item) => (
                <a
                  key={item.name}
                  data-nav={item.name}
                  href={item.href}
                  onClick={(e) => { e.preventDefault(); scrollTo(item.href); }}
                  className={`text-sm font-medium transition-colors duration-200 cursor-pointer ${
                    activeSection === item.name
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.name}
                </a>
              ))}
              <ThemeToggle />
            </nav>

            {/* Mobile */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navItems={navItems}
        activeSection={activeSection}
      />
    </>
  );
};
