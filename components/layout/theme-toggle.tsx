"use client";

import * as React from "react";
import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
        <Sun className="h-4 w-4 text-muted-foreground" />
      </Button>
    );
  }

  const toggleNext = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleNext}
      className="h-9 w-9 rounded-xl hover:bg-muted transition-colors"
      title={`Current theme: ${theme}. Click to switch.`}
    >
      {theme === "dark" ? (
        <Moon className="h-4 w-4 text-zinc-200" />
      ) : theme === "system" ? (
        <Laptop className="h-4 w-4 text-muted-foreground" />
      ) : (
        <Sun className="h-4 w-4 text-amber-500" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
