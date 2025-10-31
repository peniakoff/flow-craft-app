"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle,
  Kanban,
  Calendar,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export function LandingPageClient() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (!loading && user) {
      router.push("/dashboard/issues");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render landing page if user is logged in (they're being redirected)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img
              src="/flowcraft-logo.png"
              alt="FlowCraft Logo"
              className="w-8 h-8 rounded-md"
            />
            <h1 className="text-xl font-semibold">FlowCraft</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Modern Task Management
            <br />
            <span className="text-primary">Made Simple</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            FlowCraft helps teams plan sprints, track issues, and deliver
            projects faster. Everything you need in one intuitive platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/register">
                Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4">
            Everything you need to ship faster
          </h3>
          <p className="text-muted-foreground text-lg">
            Powerful features designed for modern development teams
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CheckCircle className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Issue Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Create, assign, and track issues with priorities and statuses.
                Keep your team aligned.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Kanban className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Kanban Boards</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Visualize your workflow with drag-and-drop kanban boards. Move
                tasks seamlessly.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Sprint Planning</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Plan and manage sprints effectively. Set goals, track progress,
                and deliver on time.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Gain insights with powerful analytics. Track velocity, burndown,
                and team performance.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl mb-4">
              Ready to get started?
            </CardTitle>
            <CardDescription className="text-primary-foreground/80 text-lg">
              Join teams around the world using FlowCraft to build better
              products.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">
                Create Your Free Account <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <img
                src="/flowcraft-logo.png"
                alt="FlowCraft Logo"
                className="w-6 h-6 rounded-md"
              />
              <span className="text-sm text-muted-foreground">
                © 2025 FlowCraft. All rights reserved.
              </span>
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <Link
                href="/login"
                className="hover:text-foreground transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="hover:text-foreground transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
