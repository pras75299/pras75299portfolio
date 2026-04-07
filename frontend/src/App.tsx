import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import Loader from "./components/Loader";
import BackgroundAnimation from "./components/BackgroundAnimation";
import CursorSpotlight from "./components/CursorSpotlight";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero/Hero";
import { Projects } from "./components/Projects";
import { Skills } from "./components/Skills";
import { GithubContributions } from "./components/GithubContributions";
import { Experience } from "./components/Experience";
import { Contact } from "./components/Contact";
import { Navbar } from "./components/Navbar";
import { RabbitFollower } from "./components/RabbitFollower";
import { ThemeProvider } from "./context/ThemeContext";
import ChatAssistant from "./components/ChatAssistant";
import ChatButton from "./components/ChatButton";

function App() {
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  // Lock scroll while loader is active
  useEffect(() => {
    document.body.style.overflow = loading ? "hidden" : "unset";
  }, [loading]);

  // When the loader calls onComplete, the main wrapper is already rendered
  // with opacity:0 (inline style below). This effect makes it visible
  // immediately — by this point Hero's useEffect has fired and GSAP's
  // immediateRender has already set the hero elements to their start
  // values (y offset + opacity:0), so there is no visible flash.
  useEffect(() => {
    if (!loading && mainRef.current) {
      gsap.set(mainRef.current, { opacity: 1 });
    }
  }, [loading]);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 relative">

        {/* Always rendered so Three.js/WebGL warms up during the loader phase.
            The Loader sits above at z-[100] with bg-background, so these are
            invisible to the user until the loader exits — but by then the
            canvas has already rendered its first frame, eliminating the blink. */}
        <BackgroundAnimation />
        <CursorSpotlight />

        {/* Loader — sits on top (z-[100]) while active */}
        {loading && <Loader onComplete={() => setLoading(false)} />}

        {/* Main content — rendered immediately but invisible until loader
            finishes; opacity:0 on the wrapper prevents the one-frame blink */}
        {!loading && (
          <div ref={mainRef} style={{ opacity: 0 }}>
            <Navbar />

            <main className="relative z-10">
              <Hero />
              <Experience />
              <Projects />
              <Skills />
              <GithubContributions />
              <Contact />
            </main>

            <Footer />
            <RabbitFollower />

            <ChatButton onClick={() => setIsChatOpen(true)} />
            <ChatAssistant
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
            />
          </div>
        )}

      </div>
    </ThemeProvider>
  );
}

export default App;
