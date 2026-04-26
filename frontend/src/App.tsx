import {
  lazy,
  startTransition,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import gsap from "gsap";
import Loader from "./components/Loader";
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
import ChatButton from "./components/ChatButton";

const loadBackgroundAnimationModule = () =>
  import("./components/BackgroundAnimation");
const LazyBackgroundAnimation = lazy(loadBackgroundAnimationModule);

const loadGithubContributionsModule = async () => {
  const module = await import("./components/GithubContributions");
  return { default: module.GithubContributions };
};
const LazyGithubContributions = lazy(loadGithubContributionsModule);

const loadChatAssistantModule = () => import("./components/ChatAssistant");
const LazyChatAssistant = lazy(loadChatAssistantModule);

const scheduleIdleTask = (callback: () => void, timeout = 300) => {
  const browserWindow = window as Window & {
    cancelIdleCallback?: (handle: number) => void;
    requestIdleCallback?: (
      cb: IdleRequestCallback,
      options?: IdleRequestOptions,
    ) => number;
  };

  if (typeof browserWindow.requestIdleCallback === "function") {
    const handle = browserWindow.requestIdleCallback(() => callback(), {
      timeout,
    });
    return () => browserWindow.cancelIdleCallback?.(handle);
  }

  const handle = window.setTimeout(callback, timeout);
  return () => window.clearTimeout(handle);
};

interface DeferredRenderProps {
  children: ReactNode;
  fallback: ReactNode;
  rootMargin?: string;
}

function DeferredRender({
  children,
  fallback,
  rootMargin = "320px 0px",
}: DeferredRenderProps) {
  const [isActive, setIsActive] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive) return;

    const sentinel = sentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === "undefined") {
      setIsActive(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsActive(true);
        }
      },
      { rootMargin },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isActive, rootMargin]);

  if (isActive) {
    return <>{children}</>;
  }

  return <div ref={sentinelRef}>{fallback}</div>;
}

const GithubSectionFallback = () => (
  <section className="py-24 px-6 relative z-10" aria-hidden="true">
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="h-3 w-16 rounded bg-muted/80 animate-pulse mb-3" />
        <div className="h-8 w-64 rounded bg-muted animate-pulse" />
      </div>
      <div className="bg-card border border-border rounded-lg p-4 md:p-6">
        <div className="h-56 rounded-md bg-muted/70 animate-pulse" />
      </div>
    </div>
  </section>
);

const ChatAssistantFallback = () => (
  <div className="fixed bottom-24 right-6 z-40 w-[min(24rem,calc(100vw-3rem))] rounded-2xl border border-border bg-background/95 p-4 shadow-2xl backdrop-blur">
    <div className="h-4 w-32 rounded bg-muted animate-pulse mb-4" />
    <div className="space-y-3">
      <div className="h-16 rounded-xl bg-muted/70 animate-pulse" />
      <div className="h-10 rounded-xl bg-muted/70 animate-pulse" />
    </div>
  </div>
);

function App() {
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [shouldRenderBackground, setShouldRenderBackground] = useState(false);
  const [shouldRenderChat, setShouldRenderChat] = useState(false);
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

  useEffect(() => {
    if (loading) return;

    const cancelIdleTask = scheduleIdleTask(() => {
      void loadBackgroundAnimationModule();
      setShouldRenderBackground(true);
    }, 250);

    return cancelIdleTask;
  }, [loading]);

  const warmChatAssistant = () => {
    void loadChatAssistantModule();
  };

  const openChat = () => {
    warmChatAssistant();
    startTransition(() => {
      setShouldRenderChat(true);
      setIsChatOpen(true);
    });
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 relative">
        {shouldRenderBackground && (
          <Suspense fallback={null}>
            <LazyBackgroundAnimation />
          </Suspense>
        )}
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
              <DeferredRender fallback={<GithubSectionFallback />}>
                <Suspense fallback={<GithubSectionFallback />}>
                  <LazyGithubContributions />
                </Suspense>
              </DeferredRender>
              <Contact />
            </main>

            <Footer />
            <RabbitFollower />

            <ChatButton onClick={openChat} onIntent={warmChatAssistant} />
            {shouldRenderChat && (
              <Suspense fallback={isChatOpen ? <ChatAssistantFallback /> : null}>
                <LazyChatAssistant
                  isOpen={isChatOpen}
                  onClose={() => setIsChatOpen(false)}
                />
              </Suspense>
            )}
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
