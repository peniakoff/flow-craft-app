import type React from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import "./globals.css";
import {
  Archivo as V0_Font_Archivo,
  Geist_Mono as V0_Font_Geist_Mono,
  PT_Serif as V0_Font_PT_Serif,
} from "next/font/google";
import { AppProvider } from "@/contexts/app-context";
import { ThemeProvider } from "@/components/theme-provider";
import ThemeToggle from "@/components/theme-toggle";

// Initialize fonts - loaders must be called and assigned to consts in module scope
const ArchivoFont = V0_Font_Archivo({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});
const GeistMonoFont = V0_Font_Geist_Mono({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});
const PTSerifFont = V0_Font_PT_Serif({
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlowCraft - Linear-style Task Management",
  description:
    "A complete task management app with sprints, kanban boards, and issue tracking",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning prevents a React hydration mismatch warning
    // because next-themes mutates <html> by adding class (light/dark) and a color-scheme style
    // on the client before hydration completes.
    <html lang="en" suppressHydrationWarning>
      <body
        className={`font-sans ${ArchivoFont.className} ${GeistMonoFont.className}`}
      >
        <ThemeProvider attribute="class" enableSystem defaultTheme="system">
          <AppProvider>
            <Suspense fallback={null}>{children}</Suspense>
          </AppProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
