"use client";

import { Button } from "@/components/ui/button";
import { CreateTeamForm } from "./create-team-form";
import { Plus } from "lucide-react";
import type { Team, TeamMember } from "@/types/teams.types";
import { TeamCard } from "./team-card";

interface TeamMembershipsMap {
  [teamId: string]: TeamMember[];
}

interface TeamsViewProps {
  teams: Team[];
  teamMemberships: TeamMembershipsMap;
  selectedTeamId: string | null;
  onCreateTeam: (data: { name: string; description?: string }) => Promise<void>;
  onDeleteTeam: (teamId: string) => Promise<void>;
  onInviteUser: (
    teamId: string,
    userId: string,
    userName: string,
    userEmail: string
  ) => Promise<void>;
  onRemoveMember: (teamId: string, membershipId: string) => Promise<void>;
  onSelectTeam: (teamId: string) => void;
}

export function TeamsView({
  teams,
  teamMemberships,
  selectedTeamId,
  onCreateTeam,
  onDeleteTeam,
  onInviteUser,
  onRemoveMember,
  onSelectTeam,
}: TeamsViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Teams</h1>
        <CreateTeamForm
          onSubmit={onCreateTeam}
          trigger={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          }
        />
      </div>

      {teams.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            You don't have any teams yet.
          </p>
          <CreateTeamForm
            onSubmit={onCreateTeam}
            trigger={
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Team
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <TeamCard
              key={team.$id}
              team={team}
              members={teamMemberships[team.$id] || []}
              isSelected={selectedTeamId === team.$id}
              onDelete={onDeleteTeam}
              onInviteUser={onInviteUser}
              onRemoveMember={onRemoveMember}
              onSelectTeam={onSelectTeam}
            />
          ))}
        </div>
      )}
    </div>
  );
}
