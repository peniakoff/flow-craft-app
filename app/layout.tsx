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
import { Roboto as V0_Font_Roboto } from "next/font/google";
import { AppProvider } from "@/contexts/app-context";
import { ThemeProvider } from "@/components/theme-provider";
const GeistMonoFont = V0_Font_Geist_Mono({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});
const RobotoFont = V0_Font_Roboto({
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FlowCraft - Linear-style Task Management",
  description:
    "A complete task management app with sprints, kanban boards, and issue tracking",
  generator: "v0.app",
  icons: {
    icon: "/favicon/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`font-sans ${RobotoFont.className} ${GeistMonoFont.className}`}
        suppressHydrationWarning
      >
        <ThemeProvider themes={["light", "dark"]} attribute="class" enableSystem={false}>
          <AppProvider>
            <Suspense fallback={null}>{children}</Suspense>
          </AppProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
