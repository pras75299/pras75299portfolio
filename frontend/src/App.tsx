import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import Loader from "./components/Loader";
import BackgroundAnimation from "./components/BackgroundAnimation";
import CursorSpotlight from "./components/CursorSpotlight";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero/Hero";
import { Projects } from "./components/Projects";
import { Skills } from "./components/Skills";
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

  useEffect(() => {
    // Prevent scrolling while loading
    if (loading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [loading]);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300 selection:bg-primary/30 relative">
        <AnimatePresence mode="wait">
          {loading && <Loader onComplete={() => setLoading(false)} />}
        </AnimatePresence>
        
        {!loading && (
          <>
            <BackgroundAnimation />
            <CursorSpotlight />
            <Navbar />
            
            <main className="relative z-10 space-y-32">
              <Hero />
              <Experience />
              <Projects />
              <Skills />
              <Contact />
            </main>
            
            <Footer />
            <RabbitFollower />

            {/* Chat Components */}
            <ChatButton onClick={() => setIsChatOpen(true)} />
            <ChatAssistant
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
            />
          </>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
