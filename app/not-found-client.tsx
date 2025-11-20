"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export function NotFoundClient() {
  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image
              src="/flowcraft-logo.png"
              alt="FlowCraft Logo"
              className="w-8 h-8 rounded-md"
              width={32}
              height={32}
            />
            <h1 className="text-xl font-semibold">FlowCraft</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* 404 Number */}
          <div className="space-y-4">
            <h2 className="text-9xl font-bold text-primary/20">404</h2>
            <h3 className="text-4xl font-bold">Page Not Found</h3>
          </div>

          {/* Description */}
          <p className="text-lg text-muted-foreground">
            Sorry, we couldn't find the page you're looking for. It might have
            been moved or deleted.
          </p>

          {/* Call to Action */}
          <div className="pt-4">
            <Button size="lg" asChild>
              <Link href="/" className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
