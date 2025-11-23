import type React from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import "@/styles/globals.css";
import { Geist_Mono as V0_Font_Geist_Mono } from "next/font/google";
import { Roboto as V0_Font_Roboto } from "next/font/google";
import { AppProvider } from "@/contexts/app-context";
import { AuthProvider } from "@/contexts/auth-context";
import { TeamsProvider } from "@/contexts/teams-context";
import { ProjectsProvider } from "@/contexts/projects-context";
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
    icon: "/favicon/favicon.png",
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
        <ThemeProvider
          themes={["light", "dark"]}
          attribute="class"
          enableSystem={false}
        >
          <AuthProvider>
            <TeamsProvider>
              <AppProvider>
                <ProjectsProvider>
                  <Suspense fallback={null}>{children}</Suspense>
                </ProjectsProvider>
              </AppProvider>
            </TeamsProvider>
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
