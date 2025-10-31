"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { TeamsView } from "@/components/teams-view";
import { useAuth } from "@/contexts/auth-context";
import { useTeams } from "@/contexts/teams-context";
import { useApp } from "@/contexts/app-context";
import { useToast } from "@/hooks/use-toast";
import type { Team, TeamMember } from "@/types/teams.types";
import { AppwriteException } from "appwrite";

interface TeamMembershipsMap {
  [teamId: string]: TeamMember[];
}

export function TeamsPageClient() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    getTeams,
    createTeam,
    deleteTeam,
    inviteUser,
    removeMember,
    getMemberships,
  } = useTeams();
  const { selectedTeamId, setSelectedTeamId } = useApp();

  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMemberships, setTeamMemberships] = useState<TeamMembershipsMap>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Load teams on mount
  useEffect(() => {
    let isMounted = true;

    if (user && isMounted) {
      loadTeams();
    }

    return () => {
      isMounted = false;
    };
  }, [user]);

  const loadTeams = async () => {
    setLoading(true);
    try {
      const fetchedTeams = await getTeams();
      setTeams(fetchedTeams);

      // Load memberships for all teams in parallel
      const membershipsMap: TeamMembershipsMap = {};
      await Promise.all(
        fetchedTeams.map(async (team) => {
          try {
            const memberships = await getMemberships(team.$id);
            console.log(`Memberships for team ${team.name}:`, memberships);
            membershipsMap[team.$id] =
              (memberships as unknown as TeamMember[]) || [];
          } catch (error) {
            console.error(
              `Failed to load memberships for team ${team.$id}:`,
              error
            );
            membershipsMap[team.$id] = [];
          }
        })
      );
      setTeamMemberships(membershipsMap);
    } catch (error) {
      console.error("Failed to load teams:", error);
      const message =
        error instanceof AppwriteException
          ? error.message
          : "Failed to load teams";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (data: {
    name: string;
    description?: string;
  }) => {
    try {
      const newTeam = await createTeam(data.name, data.description);
      setTeams([...teams, newTeam]);
      // Initialize empty memberships for new team - they'll be loaded when accessed
      setTeamMemberships({
        ...teamMemberships,
        [newTeam.$id]: [],
      });
      toast({
        title: "Success",
        description: "Team created successfully",
      });
    } catch (error) {
      console.error("Create team error:", error);
      const message =
        error instanceof AppwriteException
          ? error.message
          : "Failed to create team";
      throw new Error(message);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      await deleteTeam(teamId);
      setTeams(teams.filter((t) => t.$id !== teamId));
      toast({
        title: "Success",
        description: "Team deleted successfully",
      });
    } catch (error) {
      console.error("Delete team error:", error);
      const message =
        error instanceof AppwriteException
          ? error.message
          : "Failed to delete team";
      throw new Error(message);
    }
  };

  const handleInviteUser = async (
    teamId: string,
    userId: string,
    userName: string,
    userEmail: string
  ) => {
    try {
      // Use Appwrite Teams API to invite by email
      // This creates a membership and sends an invitation email
      // Pass userName so it's stored in the membership
      await inviteUser(
        teamId,
        userEmail,
        ["member"],
        `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/teams/accept-invite`,
        userName || undefined // Only pass name if provided
      );
      // Reload memberships for this team to show new pending member
      const memberships = await getMemberships(teamId);
      setTeamMemberships({
        ...teamMemberships,
        [teamId]: (memberships as unknown as TeamMember[]) || [],
      });
      toast({
        title: "Success",
        description: `Invitation sent to ${userEmail}`,
      });
    } catch (error) {
      console.error("Invite user error:", error);
      const message =
        error instanceof AppwriteException
          ? error.message
          : "Failed to invite user";
      throw new Error(message);
    }
  };

  const handleRemoveMember = async (teamId: string, membershipId: string) => {
    try {
      await removeMember(teamId, membershipId);
      // Reload memberships for this team after removing member
      const memberships = await getMemberships(teamId);
      setTeamMemberships({
        ...teamMemberships,
        [teamId]: (memberships as unknown as TeamMember[]) || [],
      });
      toast({
        title: "Success",
        description: "Member removed from team",
      });
    } catch (error) {
      console.error("Remove member error:", error);
      const message =
        error instanceof AppwriteException
          ? error.message
          : "Failed to remove member";
      throw new Error(message);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation currentView="teams" />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  const handleSelectTeam = (teamId: string) => {
    setSelectedTeamId(teamId);
    toast({
      title: "Team Selected",
      description: "Issues and sprints will now be filtered for this team.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentView="teams" />
      <main className="container mx-auto px-4 py-8">
        <TeamsView
          teams={teams}
          teamMemberships={teamMemberships}
          selectedTeamId={selectedTeamId}
          onCreateTeam={handleCreateTeam}
          onDeleteTeam={handleDeleteTeam}
          onInviteUser={handleInviteUser}
          onRemoveMember={handleRemoveMember}
          onSelectTeam={handleSelectTeam}
        />
      </main>
    </div>
  );
}
