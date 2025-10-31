"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RegisterForm } from "@/components/register-form";
import { useAuth } from "@/contexts/auth-context";
import Image from "next/image";

export function RegisterPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const redirectTo = searchParams.get("redirect") || "/dashboard/issues";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (!loading && user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  // Show loading spinner until component is mounted and auth check is complete
  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render register page if user is logged in (they're being redirected)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <Image
              src="/flowcraft-logo.png"
              alt="FlowCraft Logo"
              className="w-10 h-10 rounded-md"
            />
            <h1 className="text-2xl font-semibold">FlowCraft</h1>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>
              Get started with FlowCraft and manage your projects effectively.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm redirectTo={redirectTo} />

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                Already have an account?{" "}
              </span>
              <Link
                href={`/login${redirectTo ? `?redirect=${redirectTo}` : ""}`}
                className="text-primary hover:underline font-medium"
              >
                Log in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
