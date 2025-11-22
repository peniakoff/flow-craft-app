"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { Issue, Sprint } from "@/types";
import {
  fetchIssuesByTeamId,
  fetchSprintsByTeamId,
  createIssue as createIssueAPI,
  updateIssue as updateIssueAPI,
  deleteIssue as deleteIssueAPI,
  createSprint as createSprintAPI,
  updateSprint as updateSprintAPI,
} from "@/lib/data";
import { useAuth } from "@/contexts/auth-context";

interface AppContextType {
  issues: Issue[];
  sprints: Sprint[];
  activeSprint: Sprint | null;
  selectedTeamId: string | null;
  loading: boolean;
  setIssues: (issues: Issue[]) => void;
  setSprints: (sprints: Sprint[]) => void;
  setActiveSprint: (sprint: Sprint | null) => void;
  setSelectedTeamId: (teamId: string | null) => void;
  loadIssues: (teamId: string) => Promise<void>;
  loadSprints: (teamId: string) => Promise<void>;
  loadTeamData: (teamId: string) => Promise<void>;
  handleCreateIssue: (issueData: Partial<Issue>) => Promise<void>;
  handleEditIssue: (issueData: Partial<Issue>) => Promise<void>;
  handleDeleteIssue: (issueId: string) => Promise<void>;
  handleAssignToSprint: (
    issueId: string,
    sprintId: string | undefined
  ) => Promise<void>;
  handleCreateSprint: (sprintData: Partial<Sprint>) => Promise<void>;
  handleEditSprint: (sprintData: Partial<Sprint>) => Promise<void>;
  handleStartSprint: (sprintId: string) => Promise<void>;
  handleEndSprint: (sprintId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const SELECTED_TEAM_KEY = "flowcraft-selected-team-id";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);
  const [selectedTeamId, setSelectedTeamIdState] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  // Load selectedTeamId from localStorage only when user is authenticated
  useEffect(() => {
    if (!authLoading && user) {
      const savedTeamId = localStorage.getItem(SELECTED_TEAM_KEY);
      if (savedTeamId) {
        setSelectedTeamIdState(savedTeamId);
      }
    } else if (!authLoading && !user) {
      // Clear selected team if user is not authenticated
      setSelectedTeamIdState(null);
    }
  }, [user, authLoading]);

  // Wrapper function to save to localStorage when setting selectedTeamId
  const setSelectedTeamId = useCallback((teamId: string | null) => {
    setSelectedTeamIdState(teamId);
    if (teamId) {
      localStorage.setItem(SELECTED_TEAM_KEY, teamId);
    } else {
      localStorage.removeItem(SELECTED_TEAM_KEY);
    }
  }, []);

  /**
   * Load issues for a specific team
   */
  const loadIssues = useCallback(async (teamId: string) => {
    try {
      setLoading(true);
      const fetchedIssues = await fetchIssuesByTeamId(teamId);
      setIssues(fetchedIssues);
    } catch (error) {
      console.error("Failed to load issues:", error);
      setIssues([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load sprints for a specific team
   */
  const loadSprints = useCallback(async (teamId: string) => {
    try {
      setLoading(true);
      const fetchedSprints = await fetchSprintsByTeamId(teamId);
      setSprints(fetchedSprints);

      // Find and set active sprint
      const active = fetchedSprints.find(
        (sprint) => sprint.sprintStatus === "Active"
      );
      setActiveSprint(active || null);
    } catch (error) {
      console.error("Failed to load sprints:", error);
      setSprints([]);
      setActiveSprint(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load all data (issues and sprints) for a specific team
   */
  const loadTeamData = useCallback(
    async (teamId: string) => {
      try {
        setLoading(true);
        await Promise.all([loadIssues(teamId), loadSprints(teamId)]);
      } catch (error) {
        console.error("Failed to load team data:", error);
      } finally {
        setLoading(false);
      }
    },
    [loadIssues, loadSprints]
  );

  /**
   * Load data when selectedTeamId changes and user is authenticated
   */
  useEffect(() => {
    if (!authLoading && user && selectedTeamId) {
      loadTeamData(selectedTeamId);
    } else if (!user || !selectedTeamId) {
      // Clear data when no team is selected or user is not authenticated
      setIssues([]);
      setSprints([]);
      setActiveSprint(null);
    }
  }, [user, authLoading, selectedTeamId, loadTeamData]);

  /**
   * Create a new issue
   */
  const handleCreateIssue = useCallback(
    async (issueData: Partial<Issue> & { assignee?: string }) => {
      if (!selectedTeamId) {
        throw new Error("No team selected");
      }

      // Create clean object with only valid database fields
      const newIssueData = {
        teamId: selectedTeamId,
        status: issueData.status || "Todo",
        priority: Number(issueData.priority) || 3,
        title: issueData.title || "",
        description: issueData.description || "",
        sprintId: issueData.sprintId || "",
        assignedUserId: issueData.assignedUserId || undefined,
      } as Omit<
        Issue,
        | "$id"
        | "$createdAt"
        | "$updatedAt"
        | "$permissions"
        | "$databaseId"
        | "$collectionId"
      >;

      const createdIssue = await createIssueAPI(newIssueData);
      setIssues([...issues, createdIssue]);
    },
    [selectedTeamId, issues]
  );

  /**
   * Edit an existing issue
   */
  const handleEditIssue = useCallback(
    async (issueData: Partial<Issue>) => {
      if (!issueData.$id) {
        throw new Error("Issue ID is required");
      }

      const updatedIssue = await updateIssueAPI(
        issueData.$id,
        issueData as Issue
      );
      setIssues(
        issues.map((i) => (i.$id === issueData.$id ? updatedIssue : i))
      );
    },
    [issues]
  );

  /**
   * Delete an issue
   */
  const handleDeleteIssue = useCallback(
    async (issueId: string) => {
      await deleteIssueAPI(issueId);
      setIssues(issues.filter((i) => i.$id !== issueId));
    },
    [issues]
  );

  /**
   * Assign issue to sprint
   */
  const handleAssignToSprint = useCallback(
    async (issueId: string, sprintId: string | undefined) => {
      const updatedIssue = await updateIssueAPI(issueId, {
        sprintId: sprintId || "",
      });
      setIssues(issues.map((i) => (i.$id === issueId ? updatedIssue : i)));
    },
    [issues]
  );

  /**
   * Create a new sprint
   */
  const handleCreateSprint = useCallback(
    async (sprintData: Partial<Sprint>) => {
      if (!selectedTeamId) {
        throw new Error("No team selected");
      }

      const newSprintData = {
        ...sprintData,
        teamId: selectedTeamId,
        sprintStatus: sprintData.sprintStatus || "Planned",
        sprintTitle: sprintData.sprintTitle || "",
        startDate: sprintData.startDate || new Date().toISOString(),
        endDate: sprintData.endDate || new Date().toISOString(),
      } as Omit<
        Sprint,
        | "$id"
        | "$createdAt"
        | "$updatedAt"
        | "$permissions"
        | "$databaseId"
        | "$collectionId"
      >;

      const createdSprint = await createSprintAPI(newSprintData);
      setSprints([...sprints, createdSprint]);
    },
    [selectedTeamId, sprints]
  );

  /**
   * Edit an existing sprint
   */
  const handleEditSprint = useCallback(
    async (sprintData: Partial<Sprint>) => {
      if (!sprintData.$id) {
        throw new Error("Sprint ID is required");
      }

      const updatedSprint = await updateSprintAPI(
        sprintData.$id,
        sprintData as Sprint
      );
      setSprints(
        sprints.map((s) => (s.$id === sprintData.$id ? updatedSprint : s))
      );
    },
    [sprints]
  );

  /**
   * Start a sprint (set status to Active)
   */
  const handleStartSprint = useCallback(
    async (sprintId: string) => {
      const updatedSprint = await updateSprintAPI(sprintId, {
        sprintStatus: "Active",
      });
      setSprints(sprints.map((s) => (s.$id === sprintId ? updatedSprint : s)));
      setActiveSprint(updatedSprint);
    },
    [sprints]
  );

  /**
   * End a sprint (set status to Completed)
   */
  const handleEndSprint = useCallback(
    async (sprintId: string) => {
      const updatedSprint = await updateSprintAPI(sprintId, {
        sprintStatus: "Completed",
      });
      setSprints(sprints.map((s) => (s.$id === sprintId ? updatedSprint : s)));
      if (activeSprint?.$id === sprintId) {
        setActiveSprint(null);
      }
    },
    [sprints, activeSprint]
  );

  return (
    <AppContext.Provider
      value={{
        issues,
        sprints,
        activeSprint,
        selectedTeamId,
        loading,
        setIssues,
        setSprints,
        setActiveSprint,
        setSelectedTeamId,
        loadIssues,
        loadSprints,
        loadTeamData,
        handleCreateIssue,
        handleEditIssue,
        handleDeleteIssue,
        handleAssignToSprint,
        handleCreateSprint,
        handleEditSprint,
        handleStartSprint,
        handleEndSprint,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
