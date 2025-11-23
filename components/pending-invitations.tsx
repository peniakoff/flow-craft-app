"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useTeams } from "@/contexts/teams-context";
import { useAuth } from "@/contexts/auth-context";
import type { Membership } from "@/types/teams.types";
import { AppwriteException } from "appwrite";
import { Check, X, Users } from "lucide-react";

interface PendingInvitationsProps {
  invitations: Membership[];
  onInvitationHandled: () => void;
}

export function PendingInvitations({
  invitations,
  onInvitationHandled,
}: PendingInvitationsProps) {
  const { acceptInvitation, declineInvitation, getTeam } = useTeams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [processing, setProcessing] = useState<string | null>(null);
  const [teamNames, setTeamNames] = useState<Record<string, string>>({});

  // Load team names for invitations
  useEffect(() => {
    const loadTeamNames = async () => {
      const names: Record<string, string> = {};
      for (const invitation of invitations) {
        try {
          const team = await getTeam(invitation.teamId);
          names[invitation.teamId] = team.name;
        } catch (error) {
          console.error(
            `Failed to load team name for ${invitation.teamId}:`,
            error
          );
          names[invitation.teamId] = "Unknown Team";
        }
      }
      setTeamNames(names);
    };

    if (invitations.length > 0) {
      loadTeamNames();
    }
  }, [invitations, getTeam]);

  const handleAccept = async (invitation: Membership) => {
    if (!user) return;

    setProcessing(invitation.$id);
    try {
      // Appwrite allows accepting invitations through updateMembershipStatus
      // when the authenticated user matches the userId in the membership.
      // We pass an empty secret - Appwrite should accept this for authenticated users.
      // If this fails, user will need to use the link from invitation email.
      await acceptInvitation(
        invitation.teamId,
        invitation.$id,
        user.$id,
        "" // Empty secret for authenticated flow
      );

      toast({
        title: "Invitation Accepted",
        description: `You've joined ${
          teamNames[invitation.teamId] || "the team"
        }!`,
      });

      onInvitationHandled();
    } catch (error) {
      console.error("Failed to accept invitation:", error);
      const message =
        error instanceof AppwriteException
          ? error.message
          : "Failed to accept invitation. Please use the link from your invitation email.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleDecline = async (invitation: Membership) => {
    setProcessing(invitation.$id);
    try {
      await declineInvitation(invitation.teamId, invitation.$id);

      toast({
        title: "Invitation Declined",
        description: `You've declined the invitation to ${
          teamNames[invitation.teamId] || "the team"
        }.`,
      });

      onInvitationHandled();
    } catch (error) {
      console.error("Failed to decline invitation:", error);
      const message =
        error instanceof AppwriteException
          ? error.message
          : "Failed to decline invitation";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  if (invitations.length === 0) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <CardTitle>Pending Invitations</CardTitle>
        </div>
        <CardDescription>
          You have {invitations.length} pending team{" "}
          {invitations.length === 1 ? "invitation" : "invitations"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {invitations.map((invitation) => (
          <Card key={invitation.$id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">
                    {teamNames[invitation.teamId] || "Loading..."}
                  </h4>
                  <Badge variant="secondary" className="text-xs">
                    Pending
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Roles: {invitation.roles.join(", ")}
                </p>
                {invitation.userName && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Invited as: {invitation.userName}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleAccept(invitation)}
                  disabled={processing === invitation.$id}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDecline(invitation)}
                  disabled={processing === invitation.$id}
                >
                  <X className="h-4 w-4 mr-1" />
                  Decline
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
