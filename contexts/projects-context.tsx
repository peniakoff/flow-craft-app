"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { useApp } from "@/contexts/app-context";
import { useAuth } from "@/contexts/auth-context";
import type { Issue, Project, ProjectStatus } from "@/types";
import {
  fetchProjectsByTeamId,
  createProject as createProjectAPI,
  updateProject as updateProjectAPI,
  deleteProject as deleteProjectAPI,
} from "@/lib/data";

interface ProjectInput {
  teamId?: string | null;
  name: string;
  description?: string;
  ownerId: string;
  ownerName?: string;
  status: ProjectStatus;
  startDate?: string;
  dueDate?: string;
  isPrivate?: boolean;
}

interface ProjectsContextValue {
  projects: Project[];
  projectAssignments: Record<string, string>;
  createProject: (payload: ProjectInput) => Promise<Project>;
  updateProject: (
    projectId: string,
    payload: Partial<ProjectInput>
  ) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  assignIssueToProject: (issueId: string, projectId: string) => void;
  removeIssueFromProject: (issueId: string) => void;
  getProjectById: (projectId: string) => Project | undefined;
  getIssuesForProject: (projectId: string) => Issue[];
  getProjectProgress: (projectId: string) => number;
  loadProjects: (teamId: string) => Promise<void>;
}

interface TeamProjectsBucket {
  projects: Project[];
  assignments: Record<string, string>;
}

const ProjectsContext = createContext<ProjectsContextValue | undefined>(
  undefined
);

const EMPTY_BUCKET: TeamProjectsBucket = {
  projects: [],
  assignments: {},
};

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const { selectedTeamId, issues, handleEditIssue } = useApp();
  const { user } = useAuth();
  const [projectsByTeam, setProjectsByTeam] = useState<
    Record<string, TeamProjectsBucket>
  >({});

  const currentBucket = useMemo(() => {
    if (!selectedTeamId) {
      return EMPTY_BUCKET;
    }

    return projectsByTeam[selectedTeamId] ?? EMPTY_BUCKET;
  }, [projectsByTeam, selectedTeamId]);

  const upsertBucket = useCallback(
    (
      teamId: string,
      updater: (current: TeamProjectsBucket) => TeamProjectsBucket
    ) => {
      if (!teamId) {
        return;
      }

      setProjectsByTeam((prev) => {
        const existing = prev[teamId] ?? EMPTY_BUCKET;
        return {
          ...prev,
          [teamId]: updater(existing),
        };
      });
    },
    []
  );

  const findBucketByProjectId = useCallback(
    (projectId: string) => {
      for (const [teamId, bucket] of Object.entries(projectsByTeam)) {
        if (bucket.projects.some((project) => project.$id === projectId)) {
          return teamId;
        }
      }
      return null;
    },
    [projectsByTeam]
  );

  const loadProjects = useCallback(
    async (teamId: string) => {
      try {
        const fetchedProjects = await fetchProjectsByTeamId(teamId, user?.$id);
        upsertBucket(teamId, (bucket) => ({
          ...bucket,
          projects: fetchedProjects,
        }));
      } catch (error) {
        console.error("Failed to load projects:", error);
      }
    },
    [upsertBucket, user?.$id]
  );

  const createProject = useCallback(
    async (payload: ProjectInput) => {
      const resolvedTeamId =
        payload.teamId !== undefined ? payload.teamId : selectedTeamId;
      if (!resolvedTeamId && !payload.isPrivate) {
        throw new Error("Select a team or mark the project as private");
      }

      const projectData = {
        teamId: resolvedTeamId ?? null,
        name: payload.name.trim(),
        description: payload.description?.trim() || undefined,
        ownerId: payload.ownerId,
        ownerName: payload.ownerName,
        status: payload.status,
        startDate: payload.startDate,
        dueDate: payload.dueDate,
        isPrivate: payload.isPrivate ?? !resolvedTeamId,
      };

      const createdProject = await createProjectAPI(projectData);

      if (resolvedTeamId) {
        upsertBucket(resolvedTeamId, (bucket) => ({
          ...bucket,
          projects: [...bucket.projects, createdProject],
        }));
      }

      return createdProject;
    },
    [selectedTeamId, upsertBucket]
  );

  const updateProject = useCallback(
    async (projectId: string, payload: Partial<ProjectInput>) => {
      const updateData: Partial<Project> = {};
      if (payload.name !== undefined) updateData.name = payload.name.trim();
      if (payload.description !== undefined)
        updateData.description = payload.description?.trim() || undefined;
      if (payload.ownerId !== undefined) updateData.ownerId = payload.ownerId;
      if (payload.ownerName !== undefined)
        updateData.ownerName = payload.ownerName;
      if (payload.status !== undefined) updateData.status = payload.status;
      if (payload.startDate !== undefined)
        updateData.startDate = payload.startDate;
      if (payload.dueDate !== undefined) updateData.dueDate = payload.dueDate;
      if (payload.teamId !== undefined) updateData.teamId = payload.teamId;
      if (payload.isPrivate !== undefined)
        updateData.isPrivate = payload.isPrivate;

      await updateProjectAPI(projectId, updateData);

      const bucketId = findBucketByProjectId(projectId);
      if (bucketId) {
        upsertBucket(bucketId, (bucket) => ({
          ...bucket,
          projects: bucket.projects.map((project) =>
            project.$id === projectId
              ? {
                  ...project,
                  ...updateData,
                }
              : project
          ),
        }));
      }
    },
    [findBucketByProjectId, upsertBucket]
  );

  const deleteProject = useCallback(
    async (projectId: string) => {
      await deleteProjectAPI(projectId);

      const bucketId = findBucketByProjectId(projectId);
      if (!bucketId) {
        return;
      }

      // Find and update all issues assigned to this project
      const projectIssueIds = Object.entries(
        projectsByTeam[bucketId]?.assignments || {}
      )
        .filter(([, assignedProjectId]) => assignedProjectId === projectId)
        .map(([issueId]) => issueId);

      // Update issues to remove projectId
      projectIssueIds.forEach((issueId) => {
        handleEditIssue({ $id: issueId, projectId: undefined });
      });

      // Remove project from the list
      upsertBucket(bucketId, (bucket) => ({
        ...bucket,
        projects: bucket.projects.filter(
          (project) => project.$id !== projectId
        ),
      }));
    },
    [findBucketByProjectId, handleEditIssue, projectsByTeam, upsertBucket]
  );

  const assignIssueToProject = useCallback(
    (issueId: string, projectId: string) => {
      if (!selectedTeamId) {
        throw new Error("Select a team before assigning issues");
      }

      const projectExists = currentBucket.projects.some(
        (project) => project.$id === projectId
      );
      if (!projectExists) {
        throw new Error("Project not found");
      }

      // Update issue with projectId in database
      handleEditIssue({ $id: issueId, projectId });
    },
    [currentBucket.projects, selectedTeamId, handleEditIssue]
  );

  const removeIssueFromProject = useCallback(
    (issueId: string) => {
      if (!selectedTeamId) {
        throw new Error("Select a team before removing assignments");
      }

      // Update issue to remove projectId in database
      handleEditIssue({ $id: issueId, projectId: undefined });
    },
    [selectedTeamId, handleEditIssue]
  );

  const getProjectById = useCallback(
    (projectId: string) =>
      currentBucket.projects.find((project) => project.$id === projectId),
    [currentBucket.projects]
  );

  const getIssuesForProject = useCallback(
    (projectId: string) => {
      if (!projectId) return [];

      return issues.filter((issue) => {
        if (!issue.$id) return false;
        if (issue.projectId === projectId) return true;
        return currentBucket.assignments[issue.$id] === projectId;
      });
    },
    [currentBucket.assignments, issues]
  );

  const getProjectProgress = useCallback(
    (projectId: string) => {
      const projectIssues = getIssuesForProject(projectId);
      if (projectIssues.length === 0) return 0;

      const completed = projectIssues.filter(
        (issue) => issue.status === "Done"
      ).length;
      return Math.round((completed / projectIssues.length) * 100);
    },
    [getIssuesForProject]
  );

  // Load projects when team changes
  useEffect(() => {
    if (!selectedTeamId) {
      setProjectsByTeam({});
      return;
    }

    void loadProjects(selectedTeamId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeamId]);

  // Memoize project assignments to avoid unnecessary re-calculations
  const issueProjectMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const issue of issues) {
      if (issue.$id && issue.projectId) {
        map[issue.$id] = issue.projectId;
      }
    }
    return map;
  }, [issues]);

  // Sync project assignments from issues' projectId field
  useEffect(() => {
    if (!selectedTeamId) {
      return;
    }

    setProjectsByTeam((prev) => {
      const bucket = prev[selectedTeamId];
      if (!bucket) {
        return prev;
      }

      // Check if assignments changed
      const hasChanged =
        Object.keys(issueProjectMap).length !==
          Object.keys(bucket.assignments).length ||
        Object.entries(issueProjectMap).some(
          ([issueId, projectId]) => bucket.assignments[issueId] !== projectId
        );

      if (!hasChanged) {
        return prev;
      }

      return {
        ...prev,
        [selectedTeamId]: {
          ...bucket,
          assignments: issueProjectMap,
        },
      };
    });
  }, [issueProjectMap, selectedTeamId]);

  const value: ProjectsContextValue = {
    projects: currentBucket.projects,
    projectAssignments: currentBucket.assignments,
    createProject,
    updateProject,
    deleteProject,
    assignIssueToProject,
    removeIssueFromProject,
    getProjectById,
    getIssuesForProject,
    getProjectProgress,
    loadProjects,
  };

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error("useProjects must be used within a ProjectsProvider");
  }
  return context;
}

export type { ProjectInput };
