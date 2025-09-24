"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface ThemeToggleProps {
  inline?: boolean; // when true renders without any wrapping div styling
  showSystemState?: boolean; // whether to show current system value in option label
}

export default function ThemeToggle({
  inline = true,
  showSystemState = true,
}: ThemeToggleProps) {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const current = theme === "system" ? systemTheme : theme;

  const select = (
    <select
      aria-label="Select theme"
      value={theme}
      onChange={(e) => setTheme(e.target.value)}
      className="bg-card text-card-foreground border border-border rounded px-2 py-1 text-sm"
    >
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="system">
        System{showSystemState && current ? ` (${current})` : ""}
      </option>
    </select>
  );

  if (inline) return select;

  return <div className="fixed right-4 bottom-4 z-50">{select}</div>;
}
