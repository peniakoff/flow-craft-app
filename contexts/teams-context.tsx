"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
} from "react";
import type {
  Team,
  TeamMember,
  Membership,
  TeamList,
  MembershipList,
} from "@/types/teams.types";
import { teams } from "@/lib/appwrite";
import { useAuth } from "@/contexts/auth-context";

interface TeamsContextType {
  teams: Team[];
  teamsCount: number;
  getTeams: () => Promise<Team[]>;
  loadTeams: () => Promise<void>;
  createTeam: (
    name: string,
    description?: string,
    roles?: string[]
  ) => Promise<Team>;
  deleteTeam: (teamId: string) => Promise<void>;
  getMembers: (teamId: string) => Promise<TeamMember[]>;
  getMemberships: (teamId: string) => Promise<Membership[]>;
  inviteUser: (
    teamId: string,
    email: string,
    roles: string[],
    redirectUrl: string,
    name?: string
  ) => Promise<Membership>;
  removeMember: (teamId: string, membershipId: string) => Promise<void>;
  updateMemberRoles: (
    teamId: string,
    membershipId: string,
    roles: string[]
  ) => Promise<Membership>;
  acceptInvitation: (
    teamId: string,
    membershipId: string,
    userId: string,
    secret: string
  ) => Promise<Membership>;
}

const TeamsContext = createContext<TeamsContextType | undefined>(undefined);

export function TeamsProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const teamsSDK = React.useMemo(() => {
    return teams;
  }, []);

  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const teamsCount = userTeams.length;

  /**
   * Get all teams for the current user
   */
  const getTeams = useCallback(async (): Promise<Team[]> => {
    try {
      const response = (await teamsSDK.list()) as TeamList;
      return response.teams || [];
    } catch (error) {
      console.error("Failed to fetch teams:", error);
      throw error;
    }
  }, [teamsSDK]);

  /**
   * Load teams and update state
   */
  const loadTeams = useCallback(async (): Promise<void> => {
    try {
      const teamsData = await getTeams();
      setUserTeams(teamsData);
    } catch (error) {
      console.error("Failed to load teams:", error);
      setUserTeams([]);
    }
  }, [getTeams]);

  // Load teams only when user is authenticated
  useEffect(() => {
    if (!authLoading && user) {
      loadTeams();
    } else if (!authLoading && !user) {
      // Clear teams if user is not authenticated
      setUserTeams([]);
    }
  }, [user, authLoading, loadTeams]);

  /**
   * Create a new team
   * Creator is automatically added as 'owner' role
   */
  const createTeam = useCallback(
    async (
      name: string,
      description?: string,
      roles: string[] = ["owner", "member", "admin"]
    ): Promise<Team> => {
      try {
        const teamId = crypto.randomUUID();
        const team = (await teamsSDK.create({ teamId, name, roles })) as Team;

        // Store description in team preferences if provided
        if (description) {
          await teamsSDK.updatePrefs({
            teamId: team.$id,
            prefs: { description },
          });

          // Fetch the updated team to get the prefs
          const updatedTeam = (await teamsSDK.get(team.$id)) as Team;
          return updatedTeam;
        }

        return team;
      } catch (error) {
        console.error("Failed to create team:", error);
        throw error;
      }
    },
    [teamsSDK]
  );

  /**
   * Delete a team (owner only)
   */
  const deleteTeam = useCallback(
    async (teamId: string): Promise<void> => {
      try {
        await teamsSDK.delete(teamId);
      } catch (error) {
        console.error("Failed to delete team:", error);
        throw error;
      }
    },
    [teamsSDK]
  );

  /**
   * Get all members of a team
   */
  const getMembers = useCallback(
    async (teamId: string): Promise<TeamMember[]> => {
      try {
        const response = (await teamsSDK.listMemberships({
          teamId,
        })) as MembershipList;

        // Return memberships directly since TeamMember extends Membership
        return (response.memberships || []) as TeamMember[];
      } catch (error) {
        console.error("Failed to fetch team members:", error);
        throw error;
      }
    },
    [teamsSDK]
  );

  /**
   * Get raw memberships data for a team
   */
  const getMemberships = useCallback(
    async (teamId: string): Promise<Membership[]> => {
      try {
        const response = (await teamsSDK.listMemberships({
          teamId,
        })) as MembershipList;
        return response.memberships || [];
      } catch (error) {
        console.error("Failed to fetch team memberships:", error);
        throw error;
      }
    },
    [teamsSDK]
  );

  /**
   * Invite a user to team via email
   * This creates a membership with pending status and sends invitation email
   */
  const inviteUser = useCallback(
    async (
      teamId: string,
      email: string,
      roles: string[] = ["member"],
      redirectUrl: string = `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/teams/accept-invite`,
      name?: string
    ): Promise<Membership> => {
      try {
        const membership = (await teamsSDK.createMembership({
          teamId,
          roles,
          email,
          userId: undefined,
          phone: undefined,
          url: redirectUrl,
          name,
        })) as Membership;

        return membership;
      } catch (error) {
        console.error("Failed to invite user:", error);
        throw error;
      }
    },
    [teamsSDK]
  );

  /**
   * Remove a member from team
   */
  const removeMember = useCallback(
    async (teamId: string, membershipId: string): Promise<void> => {
      try {
        await teamsSDK.deleteMembership({ teamId, membershipId });
      } catch (error) {
        console.error("Failed to remove team member:", error);
        throw error;
      }
    },
    [teamsSDK]
  );

  /**
   * Update member roles
   */
  const updateMemberRoles = useCallback(
    async (
      teamId: string,
      membershipId: string,
      roles: string[]
    ): Promise<Membership> => {
      try {
        const membership = (await teamsSDK.updateMembership({
          teamId,
          membershipId,
          roles,
        })) as Membership;
        return membership;
      } catch (error) {
        console.error("Failed to update member roles:", error);
        throw error;
      }
    },
    [teamsSDK]
  );

  /**
   * Accept team invitation via email link
   * Called when user clicks link in invitation email
   */
  const acceptInvitation = useCallback(
    async (
      teamId: string,
      membershipId: string,
      userId: string,
      secret: string
    ): Promise<Membership> => {
      try {
        const membership = (await teamsSDK.updateMembershipStatus({
          teamId,
          membershipId,
          userId,
          secret,
        })) as Membership;
        return membership;
      } catch (error) {
        console.error("Failed to accept invitation:", error);
        throw error;
      }
    },
    [teamsSDK]
  );

  const value: TeamsContextType = {
    teams: userTeams,
    teamsCount,
    getTeams,
    loadTeams,
    createTeam,
    deleteTeam,
    getMembers,
    getMemberships,
    inviteUser,
    removeMember,
    updateMemberRoles,
    acceptInvitation,
  };

  return (
    <TeamsContext.Provider value={value}>{children}</TeamsContext.Provider>
  );
}

export function useTeams() {
  const context = useContext(TeamsContext);
  if (context === undefined) {
    throw new Error("useTeams must be used within a TeamsProvider");
  }
  return context;
}
