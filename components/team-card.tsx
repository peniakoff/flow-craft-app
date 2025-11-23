"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import type { Team, TeamMember } from "@/types/teams.types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Trash2, UserPlus, Crown } from "lucide-react";
import { DeleteTeamDialog } from "./delete-team-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InviteUserDialog } from "./invite-user-dialog";

interface TeamCardProps {
  team: Team;
  members: TeamMember[];
  isSelected: boolean;
  onDelete: (teamId: string) => Promise<void>;
  onInviteUser: (
    teamId: string,
    userId: string,
    userName: string,
    userEmail: string
  ) => Promise<void>;
  onRemoveMember: (teamId: string, membershipId: string) => Promise<void>;
  onSelectTeam: (teamId: string) => void;
}

export function TeamCard({
  team,
  members,
  isSelected,
  onDelete,
  onInviteUser,
  onRemoveMember,
  onSelectTeam,
}: TeamCardProps) {
  const { user } = useAuth();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  // Check if current user is team owner
  const userMembership = members.find((m) => m.userId === user?.$id);
  const isTeamOwner = userMembership?.roles.includes("owner");

  const handleSelectChange = (checked: boolean) => {
    if (checked) {
      onSelectTeam(team.$id);
    }
  };

  const handleRemoveMember = async (membershipId: string) => {
    try {
      await onRemoveMember(team.$id, membershipId);
      // Members will be updated from parent component
    } catch (error) {
      console.error("Failed to remove member:", error);
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email ? email[0].toUpperCase() : "?";
  };

  return (
    <Card className={isSelected ? "ring-2 ring-primary" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {team.name}
              {isTeamOwner && (
                <Badge variant="outline" className="text-xs">
                  <Crown className="h-3 w-3 mr-1" />
                  Owner
                </Badge>
              )}
            </CardTitle>
            {team.prefs && (team.prefs as any).description && (
              <CardDescription className="mt-2">
                {(team.prefs as any).description}
              </CardDescription>
            )}
          </div>
          {isTeamOwner && (
            <DeleteTeamDialog
              teamName={team.name}
              onConfirm={() => onDelete(team.$id)}
              trigger={
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              }
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
          <Checkbox
            id={`select-team-${team.$id}`}
            checked={isSelected}
            onCheckedChange={handleSelectChange}
          />
          <label
            htmlFor={`select-team-${team.$id}`}
            className="text-sm font-medium leading-none cursor-pointer"
          >
            Currently selected team
          </label>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {members.length} member{members.length !== 1 ? "s" : ""}
            </span>
          </div>
          {isTeamOwner && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInviteDialogOpen(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invite
            </Button>
          )}
        </div>

        {members.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Members</p>
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.$id}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-accent"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(member.userName, member.userEmail)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {member.userName || "Unknown"}
                        {member.roles.includes("owner") && (
                          <Crown className="inline h-3 w-3 ml-1 text-yellow-600" />
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {member.userEmail}
                      </span>
                    </div>
                  </div>
                  {isTeamOwner && !member.roles.includes("owner") && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleRemoveMember(member.$id)}
                          >
                            <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Remove member</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {/* Invite User Dialog */}
      <InviteUserDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        teamId={team.$id}
        teamName={team.name}
        onInvite={onInviteUser}
      />
    </Card>
  );
}
