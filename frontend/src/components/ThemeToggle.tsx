import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);
  const [prefLocked, setPrefLocked] = useState<boolean>(false);
  const [isFading, setIsFading] = useState<boolean>(false);
  const [overlayVariant, setOverlayVariant] = useState<"light" | "dark">("light");
  const [spinning, setSpinning] = useState<boolean>(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const media = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
    const prefersDark = media ? media.matches : false;
    const enableDark = stored ? stored === "dark" : prefersDark;
    setIsDark(enableDark);
    setPrefLocked(!!stored);
    document.documentElement.classList.toggle("dark", enableDark);
    document.documentElement.style.setProperty("color-scheme", enableDark ? "dark" : "light");

    // Seamless system preference sync if user hasn't chosen explicitly
    const handler = (e: MediaQueryListEvent) => {
      if (!prefLocked) {
        const next = e.matches;
        setIsDark(next);
        document.documentElement.classList.add("theme-transition");
        document.documentElement.classList.toggle("dark", next);
        document.documentElement.style.setProperty("color-scheme", next ? "dark" : "light");
        // Cinematic crossfade overlay on system change
        setOverlayVariant(next ? "dark" : "light");
        setIsFading(true);
        setTimeout(() => setIsFading(false), 450);
        setTimeout(() => document.documentElement.classList.remove("theme-transition"), 400);
      }
    };
    media?.addEventListener("change", handler);
    return () => media?.removeEventListener("change", handler);
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.add("theme-transition");
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.style.setProperty("color-scheme", next ? "dark" : "light");
    setTimeout(() => document.documentElement.classList.remove("theme-transition"), 400);
    localStorage.setItem("theme", next ? "dark" : "light");
    setPrefLocked(true);

    // Cinematic overlay fade
    setOverlayVariant(next ? "dark" : "light");
    setIsFading(true);
    setTimeout(() => setIsFading(false), 450);

    // Single spin animation on the button
    setSpinning(true);
    setTimeout(() => setSpinning(false), 420);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={toggle}
        aria-label="Toggle theme"
        className={`transition-colors duration-300 ${spinning ? "spin-once" : ""}`}
      >
        <span className="relative inline-block h-4 w-4">
          <Sun
            className={`absolute inset-0 h-4 w-4 transition-opacity duration-300 ${
              isDark ? "opacity-100" : "opacity-0"
            }`}
          />
          <Moon
            className={`absolute inset-0 h-4 w-4 transition-opacity duration-300 ${
              isDark ? "opacity-0" : "opacity-100"
            }`}
          />
        </span>
      </Button>

      {isFading &&
        createPortal(
          <div
            className={`fixed inset-0 pointer-events-none z-[1000] fade-in-out ${
              overlayVariant === "dark" ? "bg-black/40" : "bg-white/60"
            }`}
          />,
          document.body
        )}
    </>
  );
};