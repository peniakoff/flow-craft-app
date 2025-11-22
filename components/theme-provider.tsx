"use client";

import * as React from "react";
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Provide app-wide defaults: use class attribute and disable system theme
  // detection so users can only choose between 'light' and 'dark' unless
  // explicit props are passed to override this behavior.
  const defaultProps: Partial<ThemeProviderProps> = {
    attribute: "class",
    enableSystem: false,
    themes: ["light", "dark"],
  };

  return (
    // props spread after defaults so callers can still override these values
    <NextThemesProvider {...defaultProps} {...props}>
      {children}
    </NextThemesProvider>
  );
}
