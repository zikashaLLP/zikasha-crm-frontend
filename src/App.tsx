import AppRouter from "@/routes/AppRouter";
import { SidebarProvider } from "@/contexts/sidebar-context";
import { useEffect, useState } from "react";
import logoRemixVideo from "@/assets/logo-remix.mp4";
import './App.css'

const PWA_SPLASH_KEY = "zikasha_pwa_intro_seen_v1";

const isPWAStandalone = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
};

function PWASplash({ onDone }: { onDone: () => void }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
      <video
        className="h-40 w-40 object-contain sm:h-56 sm:w-56"
        src={logoRemixVideo}
        autoPlay
        muted
        playsInline
        onEnded={onDone}
        onError={onDone}
      />
    </div>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isPWAStandalone()) {
      setReady(true);
      return;
    }

    const alreadySeen = localStorage.getItem(PWA_SPLASH_KEY) === "1";
    if (!alreadySeen) {
      setShowSplash(true);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!showSplash) return;
    const timeout = window.setTimeout(() => {
      setShowSplash(false);
      localStorage.setItem(PWA_SPLASH_KEY, "1");
    }, 5000);
    return () => window.clearTimeout(timeout);
  }, [showSplash]);

  const handleSplashDone = () => {
    setShowSplash(false);
    localStorage.setItem(PWA_SPLASH_KEY, "1");
  };

  if (!ready) return null;

  return( 
    <SidebarProvider>
      {showSplash ? <PWASplash onDone={handleSplashDone} /> : <AppRouter />}
    </SidebarProvider> 
  );
}

export default App;
