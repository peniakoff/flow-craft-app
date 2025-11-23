"use client";

import { useAuth } from "@/contexts/auth-context";
import { UpdateNameForm } from "@/components/update-name-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export function PageClient() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard" className="inline-flex items-center space-x-2">
          <Image
            src="/flowcraft-logo.png"
            alt="FlowCraft"
            width={50}
            height={50}
            className="h-10 w-10"
            loading="eager"
          />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
        </div>
      </div>
      <p className="text-muted-foreground mb-8">
        Manage your profile information
      </p>

      <div className="space-y-6">
        {/* Update Name Section */}
        <Card>
          <CardHeader>
            <CardTitle>Change Name</CardTitle>
            <CardDescription>
              Current name: <strong>{user.name || "Not set"}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UpdateNameForm currentName={user.name || ""} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
