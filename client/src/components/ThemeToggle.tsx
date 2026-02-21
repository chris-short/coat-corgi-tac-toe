import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      className="rounded-full w-10 h-10 bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-colors"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-orange-500" aria-hidden="true" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-slate-700" aria-hidden="true" />
    </Button>
  );
}
