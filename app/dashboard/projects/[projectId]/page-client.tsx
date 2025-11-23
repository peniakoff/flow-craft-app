"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Link2, Loader2, Trash2 } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { useAuth } from "@/contexts/auth-context";
import { useProjects } from "@/contexts/projects-context";
import { useTeams } from "@/contexts/teams-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProjectStatusBadge } from "@/components/projects/project-status-badge";
import { ProjectForm } from "@/components/projects/project-form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { fetchProjectById } from "@/lib/data";
import type { Issue, IssueStatus, Project } from "@/types";

const ISSUE_STATUSES: IssueStatus[] = [
  "Todo",
  "In Progress",
  "In Review",
  "Done",
];

interface ProjectDetailsPageClientProps {
  projectId: string;
}

export function ProjectDetailsPageClient({
  projectId,
}: ProjectDetailsPageClientProps) {
  const { sprints, issues } = useApp();
  const router = useRouter();
  const { user } = useAuth();
  const {
    getProjectProgress,
    getIssuesForProject,
    assignIssueToProject,
    removeIssueFromProject,
    updateProject,
    deleteProject,
  } = useProjects();
  const { teams } = useTeams();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProject() {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedProject = await fetchProjectById(projectId);

        if (isMounted) {
          setProject(fetchedProject);
        }
      } catch (err) {
        console.error("Failed to load project:", err);
        if (isMounted) {
          setError("Failed to load project");
          setProject(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProject();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const projectProgress =
    project && project.$id ? getProjectProgress(project.$id) : 0;
  const projectIssues = useMemo(
    () => (project && project.$id ? getIssuesForProject(project.$id) : []),
    [getIssuesForProject, project]
  );
  const [selectedIssueId, setSelectedIssueId] = useState<string>("");

  const unassignedIssues = useMemo(
    () => issues.filter((issue) => issue.$id && !issue.projectId),
    [issues]
  );

  useEffect(() => {
    if (
      selectedIssueId &&
      !unassignedIssues.some((issue) => issue.$id === selectedIssueId)
    ) {
      setSelectedIssueId("");
    }
  }, [selectedIssueId, unassignedIssues]);

  const groupedIssues = useMemo(() => {
    const result: Record<
      IssueStatus,
      { sprintId: string; sprintName: string; issues: Issue[] }[]
    > = {
      Todo: [],
      "In Progress": [],
      "In Review": [],
      Done: [],
    };

    ISSUE_STATUSES.forEach((status) => {
      const issuesForStatus = projectIssues.filter(
        (issue) => issue.status === status
      );
      const sprintMap = new Map<string, Issue[]>();

      issuesForStatus.forEach((issue) => {
        const sprintKey = issue.sprintId || "backlog";
        const bucket = sprintMap.get(sprintKey) ?? [];
        bucket.push(issue);
        sprintMap.set(sprintKey, bucket);
      });

      result[status] = Array.from(sprintMap.entries()).map(
        ([sprintId, bucketIssues]) => {
          const sprintName =
            sprintId === "backlog"
              ? "Backlog"
              : sprints.find((sprint) => sprint.$id === sprintId)
                  ?.sprintTitle || "Unknown sprint";

          return {
            sprintId,
            sprintName,
            issues: bucketIssues,
          };
        }
      );
    });

    return result;
  }, [projectIssues, sprints]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading project...</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error || !project) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project not found</CardTitle>
          <CardDescription>
            The project you are looking for does not exist or was removed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dashboard/projects">Back to projects</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Check access permissions for private projects
  if (project.isPrivate && user && project.ownerId !== user.$id) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            This is a private project. Only the project owner has access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dashboard/projects">Back to projects</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const totalIssues = projectIssues.length;
  const completedIssues = projectIssues.filter(
    (issue) => issue.status === "Done"
  ).length;
  const canEdit = user?.$id === project.ownerId;
  const teamLabel = project.teamId
    ? teams.find((team) => team.$id === project.teamId)?.name || "Team"
    : "Private";

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/issues">
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/projects">
                Projects
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{project.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <Button
              variant="ghost"
              asChild
              className="mb-2 w-fit px-0 text-muted-foreground"
            >
              <Link
                href="/dashboard/projects"
                className="inline-flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Projects
              </Link>
            </Button>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold">{project.name}</h1>
              <ProjectStatusBadge status={project.status} />
              <Badge variant="outline">{teamLabel}</Badge>
              {project.isPrivate && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="cursor-help">
                        Private
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Only the project owner can view this project</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {project.dueDate && (
                <Badge variant="secondary">
                  Due {new Date(project.dueDate).toLocaleDateString()}
                </Badge>
              )}
            </div>
            {project.description && (
              <p className="max-w-3xl text-muted-foreground">
                {project.description}
              </p>
            )}
          </div>
          {canEdit && (
            <div className="flex flex-wrap gap-2">
              <ProjectForm
                project={project}
                title="Edit Project"
                trigger={<Button variant="outline">Edit Project</Button>}
                onSubmit={async (values) => {
                  if (project && project.$id) {
                    await updateProject(project.$id, values);
                  }
                }}
              />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete project</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove the project and detach all linked issues.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={async () => {
                        if (project && project.$id) {
                          await deleteProject(project.$id);
                          router.push("/dashboard/projects");
                          router.refresh();
                        }
                      }}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
            <CardDescription>
              {completedIssues} of {totalIssues} issues completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={projectProgress} className="h-3" />
            <div className="mt-2 text-sm text-muted-foreground">
              {projectProgress}% complete
            </div>
            <Separator className="my-4" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Owner</p>
                <p className="font-medium">
                  {project.ownerName || "Not assigned"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {project.ownerId}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Timeline</p>
                <p className="font-medium">
                  {project.startDate
                    ? new Date(project.startDate).toLocaleDateString()
                    : "TBD"}{" "}
                  -
                  {project.dueDate
                    ? new Date(project.dueDate).toLocaleDateString()
                    : "TBD"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total issues</p>
                <p className="font-medium">{totalIssues}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {canEdit ? (
        <Card>
          <CardHeader>
            <CardTitle>Link existing issues</CardTitle>
            <CardDescription>
              Attach backlog items to this initiative to keep progress in sync.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Select value={selectedIssueId} onValueChange={setSelectedIssueId}>
              <SelectTrigger className="sm:w-80">
                <SelectValue placeholder="Search issues" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {unassignedIssues.length === 0 && (
                  <SelectItem disabled value="__none">
                    No available issues
                  </SelectItem>
                )}
                {unassignedIssues.map((issue) => (
                  <SelectItem key={issue.$id} value={issue.$id!}>
                    {issue.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              disabled={!selectedIssueId || selectedIssueId === "__none"}
              onClick={() => {
                if (!selectedIssueId) return;
                assignIssueToProject(selectedIssueId, projectId);
                setSelectedIssueId("");
              }}
            >
              Attach Issue
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Issue links</CardTitle>
            <CardDescription>
              Only the project owner can link or unlink issues.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="space-y-6">
        {ISSUE_STATUSES.map((status) => {
          const sprintGroups = groupedIssues[status];
          return (
            <Card key={status}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{status}</CardTitle>
                    <CardDescription>
                      {sprintGroups.reduce(
                        (sum, group) => sum + group.issues.length,
                        0
                      )}{" "}
                      issues
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {sprintGroups.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No issues in this status.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {sprintGroups.map((group) => (
                      <div
                        key={`${status}-${group.sprintId}`}
                        className="space-y-3"
                      >
                        <div className="flex items-center gap-2">
                          <Link2 className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm font-medium">
                            {group.sprintName}
                          </p>
                          <Badge variant="outline">{group.issues.length}</Badge>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          {group.issues.map((issue) => (
                            <Card key={issue.$id} className="border-muted">
                              <CardContent className="space-y-3 p-4">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium">{issue.title}</p>
                                  <Badge variant="secondary">
                                    P{issue.priority}
                                  </Badge>
                                </div>
                                {issue.description && (
                                  <p className="line-clamp-2 text-sm text-muted-foreground">
                                    {issue.description}
                                  </p>
                                )}
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span>{issue.status}</span>
                                  {canEdit && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-destructive"
                                      onClick={() =>
                                        issue.$id &&
                                        removeIssueFromProject(issue.$id)
                                      }
                                      aria-label="Remove from project"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
