import { Hero } from "./components/Hero/Hero";
import { Projects } from "./components/Projects";
import { Skills } from "./components/Skills";
import { Experience } from "./components/Experience";
import { Navbar } from "./components/Navbar";
import { RabbitFollower } from "./components/RabbitFollower";
import { ThemeProvider } from "./context/ThemeContext";
import ChatAssistant from "./components/ChatAssistant";
import ChatButton from "./components/ChatButton";
import { useState } from "react";

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-white transition-colors duration-200">
        <Navbar />
        <Hero />
        <Projects />
        <Experience />
        <Skills />
        <RabbitFollower />

        {/* Chat Components */}
        <ChatButton onClick={() => setIsChatOpen(true)} />
        <ChatAssistant
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
