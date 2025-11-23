"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useTeams } from "@/contexts/teams-context";
import { useAuth } from "@/contexts/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export function AcceptInvitePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { acceptInvitation } = useTeams();
  const { user, login } = useAuth();

  const [status, setStatus] = useState<
    "loading" | "needsLogin" | "success" | "error"
  >("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [teamName, setTeamName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const acceptInvite = async () => {
      // Get parameters from URL
      const teamId = searchParams.get("teamId");
      const membershipId = searchParams.get("membershipId");
      const userId = searchParams.get("userId");
      const secret = searchParams.get("secret");

      // Validate parameters
      if (!teamId || !membershipId || !userId || !secret) {
        setStatus("error");
        setErrorMessage(
          "Invalid invitation link. Missing required parameters."
        );
        return;
      }

      // If user is not logged in, we need to accept the invitation first
      // (updateMembershipStatus works without authentication using the secret)
      // Then prompt user to login
      if (!user) {
        try {
          // Accept the invitation without being logged in
          await acceptInvitation(teamId, membershipId, userId, secret);

          // Now show login form
          setStatus("needsLogin");
          return;
        } catch (error) {
          console.error("Failed to accept invitation:", error);
          setStatus("error");

          if (error instanceof Error) {
            setErrorMessage(error.message);
          } else {
            setErrorMessage(
              "Failed to accept invitation. The link may have expired or already been used."
            );
          }
          return;
        }
      }

      // If user is logged in, verify userId matches
      if (user.$id !== userId) {
        setStatus("error");
        setErrorMessage(
          "This invitation was sent to a different user. Please log in with the correct account."
        );
        return;
      }

      try {
        // Accept the invitation
        const membership = await acceptInvitation(
          teamId,
          membershipId,
          userId,
          secret
        );

        // Get team name from membership if available
        if (membership && typeof membership === "object") {
          // Team name might be in membership object
          setTeamName("the team");
        }

        setStatus("success");

        // Redirect to teams page after 2 seconds
        setTimeout(() => {
          router.push("/dashboard/teams");
        }, 2000);
      } catch (error) {
        console.error("Failed to accept invitation:", error);
        setStatus("error");

        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage(
            "Failed to accept invitation. The link may have expired or already been used."
          );
        }
      }
    };

    acceptInvite();
  }, [searchParams, user, acceptInvitation, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMessage("Email and password are required");
      return;
    }

    setIsLoggingIn(true);
    setErrorMessage("");

    try {
      // Login with email and password
      await login(email, password);

      // Show success
      setStatus("success");

      // Redirect to teams page
      setTimeout(() => {
        router.push("/dashboard/teams");
      }, 2000);
    } catch (error) {
      console.error("Failed to login:", error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Failed to login. Please check your credentials.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Team Invitation</CardTitle>
          <CardDescription>
            {status === "loading" && "Processing your invitation..."}
            {status === "needsLogin" && "Login to complete your invitation"}
            {status === "success" && "Invitation accepted successfully!"}
            {status === "error" && "Unable to accept invitation"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Accepting your team invitation...
              </p>
            </div>
          )}

          {status === "needsLogin" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Your team invitation has been accepted! Please login to access
                  your team.
                </p>
                <p className="text-xs text-muted-foreground">
                  If you don&apos;t have a password yet, you can{" "}
                  <Link
                    href="/forgot-password"
                    className="text-primary hover:underline"
                  >
                    request a password reset
                  </Link>{" "}
                  to set your password.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoggingIn}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoggingIn}
                />
              </div>

              {errorMessage && (
                <p className="text-sm text-destructive">{errorMessage}</p>
              )}

              <Button type="submit" className="w-full" disabled={isLoggingIn}>
                {isLoggingIn ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login to Team"
                )}
              </Button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground hover:text-primary underline"
                >
                  Go to login page instead
                </Link>
              </div>
            </form>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <div className="text-center">
                <p className="font-medium">Welcome to {teamName}!</p>
                <p className="text-sm text-muted-foreground">
                  Redirecting you to your teams page...
                </p>
              </div>
              <Button asChild>
                <Link href="/dashboard/teams">Go to Teams</Link>
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <XCircle className="h-12 w-12 text-destructive" />
              <div className="text-center space-y-2">
                <p className="font-medium text-destructive">Error</p>
                <p className="text-sm text-muted-foreground">{errorMessage}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href="/login">Log In</Link>
                </Button>
                <Button asChild>
                  <Link href="/dashboard/teams">Go to Teams</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
