"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { useAuth } from "@/contexts/auth-context";
import { useProjects } from "@/contexts/projects-context";
import { useTeams } from "@/contexts/teams-context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { ProjectForm } from "@/components/projects/project-form";
import { ProjectStatusBadge } from "@/components/projects/project-status-badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchProjectsDirectory } from "@/lib/data";
import type { Project, ProjectStatus } from "@/types";

const DATE_FILTERS = [
  { value: "all", label: "All Dates" },
  { value: "overdue", label: "Overdue" },
  { value: "this-quarter", label: "This Quarter" },
] as const;

const TEAM_FILTER_ALL = "all";
const TEAM_FILTER_PRIVATE = "__private__";
const OWNER_FILTER_ALL = "all";
const OWNER_FILTER_ME = "__me";
const PAGE_SIZE = 10;

type DateFilterValue = (typeof DATE_FILTERS)[number]["value"];

function isOverdue(project: Project) {
  if (!project.dueDate) return false;
  const due = new Date(project.dueDate);
  const today = new Date();
  return due < today && project.status !== "Completed";
}

export function ProjectsPageClient() {
  const { selectedTeamId } = useApp();
  const { user } = useAuth();
  const { teams } = useTeams();
  const { createProject, updateProject, deleteProject, getProjectProgress } =
    useProjects();

  const [teamFilter, setTeamFilter] = useState<string>(TEAM_FILTER_ALL);
  const [ownerFilter, setOwnerFilter] = useState<string>(OWNER_FILTER_ALL);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">(
    "all"
  );
  const [dateFilter, setDateFilter] = useState<DateFilterValue>("all");
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPage(0);
  }, [teamFilter, ownerFilter, statusFilter, dateFilter]);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchProjectsDirectory({
        page,
        limit: PAGE_SIZE,
        status: statusFilter === "all" ? undefined : statusFilter,
        ownerId:
          ownerFilter === OWNER_FILTER_ALL
            ? undefined
            : ownerFilter === OWNER_FILTER_ME
            ? user?.$id
            : ownerFilter,
        teamId:
          teamFilter === TEAM_FILTER_ALL || teamFilter === TEAM_FILTER_PRIVATE
            ? undefined
            : teamFilter,
        privateOnly: teamFilter === TEAM_FILTER_PRIVATE,
        dateFilter,
        viewerId: user?.$id,
      });
      setProjects(response.projects);
      setTotalCount(response.total);
    } catch (err) {
      console.error("Failed to load projects", err);
      setError("Unable to load projects. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [dateFilter, ownerFilter, page, statusFilter, teamFilter, user?.$id]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const ownerOptions = useMemo(() => {
    const unique = new Map<string, string>();
    projects.forEach((project) => {
      if (project.ownerId) {
        unique.set(project.ownerId, project.ownerName || "Unassigned");
      }
    });

    if (user) {
      unique.set(user.$id, user.name || user.email || "Me");
    }

    return Array.from(unique.entries()).map(([id, label]) => ({ id, label }));
  }, [projects, user]);

  const teamNameMap = useMemo(() => {
    const map = new Map<string, string>();
    teams.forEach((team) => map.set(team.$id, team.name));
    return map;
  }, [teams]);

  const hasNext = (page + 1) * PAGE_SIZE < totalCount;
  const hasPrev = page > 0;
  const firstVisible = totalCount === 0 ? 0 : page * PAGE_SIZE + 1;
  const lastVisible = page * PAGE_SIZE + projects.length;

  const handleCreate = useCallback(
    async (values: Parameters<typeof createProject>[0]) => {
      await createProject(values);
      await loadProjects();
    },
    [createProject, loadProjects]
  );

  const handleUpdate = useCallback(
    async (projectId: string, values: Parameters<typeof updateProject>[1]) => {
      await updateProject(projectId, values);
      await loadProjects();
    },
    [loadProjects, updateProject]
  );

  const handleDelete = useCallback(
    async (projectId: string) => {
      await deleteProject(projectId);
      await loadProjects();
    },
    [deleteProject, loadProjects]
  );

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
              <BreadcrumbPage>Projects</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Projects</h1>
            <p className="text-muted-foreground">
              Monitor every initiative across teams or your private workspace.
            </p>
          </div>
          <ProjectForm
            title="Create Project"
            description="Add a new initiative to your workspace or a team."
            trigger={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            }
            onSubmit={handleCreate}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Filters</CardTitle>
              <CardDescription>
                {totalCount === 0
                  ? "No projects to show"
                  : `Showing ${firstVisible.toLocaleString()}-${lastVisible.toLocaleString()} of ${totalCount.toLocaleString()} projects`}
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <Select value={teamFilter} onValueChange={setTeamFilter}>
                <SelectTrigger className="md:w-48">
                  <SelectValue placeholder="Team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TEAM_FILTER_ALL}>All Teams</SelectItem>
                  <SelectItem value={TEAM_FILTER_PRIVATE}>Private</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.$id} value={team.$id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={ownerFilter} onValueChange={setOwnerFilter}>
                <SelectTrigger className="md:w-48">
                  <SelectValue placeholder="Owner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={OWNER_FILTER_ALL}>All Owners</SelectItem>
                  {user && (
                    <SelectItem value={OWNER_FILTER_ME}>My Projects</SelectItem>
                  )}
                  {ownerOptions.map((owner) => (
                    <SelectItem key={owner.id} value={owner.id}>
                      {owner.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={statusFilter}
                onValueChange={(value: ProjectStatus | "all") =>
                  setStatusFilter(value)
                }
              >
                <SelectTrigger className="md:w-44">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Planned">Planned</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="At Risk">At Risk</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={dateFilter}
                onValueChange={(value: DateFilterValue) => setDateFilter(value)}
              >
                <SelectTrigger className="md:w-44">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  {DATE_FILTERS.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[220px]">Project</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className="flex items-center justify-between gap-4">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {!loading && projects.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground"
                  >
                    {error || "No projects match the current filters."}
                  </TableCell>
                </TableRow>
              )}
              {projects.map((project) => {
                const progress =
                  selectedTeamId &&
                  project.teamId &&
                  project.teamId === selectedTeamId &&
                  project.$id
                    ? getProjectProgress(project.$id)
                    : null;
                const canEdit = user?.$id === project.ownerId;
                const teamLabel = project.teamId
                  ? teamNameMap.get(project.teamId) || "Team"
                  : "Private";
                return (
                  <TableRow
                    key={project.$id}
                    className={
                      isOverdue(project) ? "bg-amber-50/50" : undefined
                    }
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/projects/${project.$id}`}
                            className="font-medium hover:underline"
                          >
                            {project.name}
                          </Link>
                          {project.isPrivate && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge
                                    variant="outline"
                                    className="text-xs cursor-help"
                                  >
                                    Private
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    Only the project owner can view this project
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                        {project.description && (
                          <p className="line-clamp-1 text-sm text-muted-foreground">
                            {project.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{teamLabel}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {project.ownerName || "Unassigned"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {project.ownerId}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <ProjectStatusBadge status={project.status} />
                    </TableCell>
                    <TableCell>
                      {project.dueDate ? (
                        <span
                          className={
                            isOverdue(project)
                              ? "font-medium text-amber-700"
                              : undefined
                          }
                        >
                          {new Date(project.dueDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          No due date
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {progress !== null ? (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{progress}%</span>
                            <Badge variant="outline" className="text-[10px]">
                              {progress === 100 ? "Complete" : "In Flight"}
                            </Badge>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Switch working team to view progress
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="View details"
                          asChild
                        >
                          <Link href={`/dashboard/projects/${project.$id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        {canEdit && (
                          <ProjectForm
                            project={project}
                            title="Edit Project"
                            trigger={
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Edit project"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            }
                            onSubmit={async (values) => {
                              if (project.$id) {
                                await handleUpdate(project.$id, values);
                              }
                            }}
                          />
                        )}
                        {canEdit && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Delete project"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete project
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove the project and detach any
                                  linked issues.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => {
                                    if (project.$id) {
                                      handleDelete(project.$id);
                                    }
                                  }}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
        <div className="flex items-center justify-between border-t px-6 py-4">
          <p className="text-sm text-muted-foreground">
            Page {page + 1} of {Math.max(1, Math.ceil(totalCount / PAGE_SIZE))}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              disabled={!hasPrev || loading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={!hasNext || loading}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
