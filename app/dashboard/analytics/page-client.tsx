"use client";

import { useMemo, useState, useEffect } from "react";
import { Models } from "appwrite";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { useApp } from "@/contexts/app-context";
import { DashboardPageLayout } from "@/components/dashboard/page-layout";
import {
  Clock,
  Users,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { teams } from "@/lib/appwrite";

interface EngineerStats {
  name: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  completionRate: number;
  avgTasksPerSprint: number;
  priorityDistribution: Record<string, number>;
}

interface SprintPerformance {
  sprintName: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  duration: number;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

export function AnalyticsPageClient() {
  const { issues, sprints, loading, selectedTeamId } = useApp();
  const [teamMembers, setTeamMembers] = useState<Models.Membership[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Fetch team members when selectedTeamId changes
  useEffect(() => {
    if (selectedTeamId) {
      setLoadingMembers(true);
      teams
        .listMemberships(selectedTeamId)
        .then((response) => {
          setTeamMembers(response.memberships);
        })
        .catch((error) => {
          console.error("Failed to fetch team members:", error);
        })
        .finally(() => {
          setLoadingMembers(false);
        });
    }
  }, [selectedTeamId]);

  // Create a map of userId to userName for quick lookup
  const userNameMap = useMemo(() => {
    const map = new Map<string, string>();
    teamMembers.forEach((member) => {
      map.set(member.userId, member.userName || member.userEmail || "Unknown");
    });
    return map;
  }, [teamMembers]);

  const engineerStats = useMemo((): EngineerStats[] => {
    const engineerMap = new Map<string, EngineerStats>();

    issues.forEach((issue) => {
      if (!issue.assignedUserId) return;

      if (!engineerMap.has(issue.assignedUserId)) {
        engineerMap.set(issue.assignedUserId, {
          name: userNameMap.get(issue.assignedUserId) || issue.assignedUserId,
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          todoTasks: 0,
          completionRate: 0,
          avgTasksPerSprint: 0,
          priorityDistribution: { P0: 0, P1: 0, P2: 0, P3: 0, P4: 0, P5: 0 },
        });
      }

      const stats = engineerMap.get(issue.assignedUserId)!;
      stats.totalTasks++;
      const priorityKey =
        `P${issue.priority}` as keyof typeof stats.priorityDistribution;
      stats.priorityDistribution[priorityKey]++;

      switch (issue.status) {
        case "Done":
          stats.completedTasks++;
          break;
        case "In Progress":
        case "In Review":
          stats.inProgressTasks++;
          break;
        case "Todo":
          stats.todoTasks++;
          break;
      }
    });

    // Calculate completion rates and average tasks per sprint
    const activeSprints =
      sprints.filter(
        (s) => s.sprintStatus === "Active" || s.sprintStatus === "Completed"
      ).length || 1;

    return Array.from(engineerMap.values()).map((stats) => ({
      ...stats,
      completionRate:
        stats.totalTasks > 0
          ? (stats.completedTasks / stats.totalTasks) * 100
          : 0,
      avgTasksPerSprint: stats.totalTasks / activeSprints,
    }));
  }, [issues, sprints, userNameMap]);

  const sprintPerformance = useMemo((): SprintPerformance[] => {
    return sprints.map((sprint) => {
      const sprintIssues = issues.filter(
        (issue) => issue.sprintId === sprint.$id
      );
      const completedTasks = sprintIssues.filter(
        (issue) => issue.status === "Done"
      ).length;
      const duration = Math.ceil(
        (new Date(sprint.endDate).getTime() -
          new Date(sprint.startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      return {
        sprintName: sprint.sprintTitle,
        totalTasks: sprintIssues.length,
        completedTasks,
        completionRate:
          sprintIssues.length > 0
            ? (completedTasks / sprintIssues.length) * 100
            : 0,
        duration,
      };
    });
  }, [issues, sprints]);

  const priorityDistribution = useMemo(() => {
    const distribution: Record<string, number> = {
      P0: 0,
      P1: 0,
      P2: 0,
      P3: 0,
      P4: 0,
      P5: 0,
    };
    issues.forEach((issue) => {
      const priorityKey = `P${issue.priority}`;
      if (priorityKey in distribution) {
        distribution[priorityKey]++;
      }
    });
    return Object.entries(distribution).map(([priority, count]) => ({
      name: priority,
      value: count,
      percentage:
        issues.length > 0 ? ((count / issues.length) * 100).toFixed(1) : "0.0",
    }));
  }, [issues]);

  const statusDistribution = useMemo(() => {
    const distribution = { Todo: 0, "In Progress": 0, "In Review": 0, Done: 0 };
    issues.forEach((issue) => {
      distribution[issue.status]++;
    });
    return Object.entries(distribution).map(([status, count]) => ({
      name: status,
      value: count,
      percentage: ((count / issues.length) * 100).toFixed(1),
    }));
  }, [issues]);

  const { totalTasks, completedTasks, inProgressTasks, overallCompletionRate } =
    useMemo(() => {
      const total = issues.length;
      const completed = issues.filter((i) => i.status === "Done").length;
      const inProgress = issues.filter(
        (i) => i.status === "In Progress" || i.status === "In Review"
      ).length;
      const completionRate = total > 0 ? (completed / total) * 100 : 0;

      return {
        totalTasks: total,
        completedTasks: completed,
        inProgressTasks: inProgress,
        overallCompletionRate: completionRate,
      };
    }, [issues]);

  const header = (
    <div className="mb-8">
      <h1 className="text-2xl font-semibold">Analytics Dashboard</h1>
      <p className="text-muted-foreground">
        Comprehensive insights into team performance and engineer utilization
        together.
      </p>
    </div>
  );

  return (
    <DashboardPageLayout
      pageName="Analytics"
      header={header}
      loading={loading || loadingMembers}
      emptyDescription="Choose a working team to view detailed analytics."
    >
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {completedTasks} completed, {inProgressTasks} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overallCompletionRate.toFixed(1)}%
            </div>
            <Progress value={overallCompletionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Engineers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engineerStats.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently working on projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Sprints
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sprints.filter((s) => s.sprintStatus === "Active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {sprints.filter((s) => s.sprintStatus === "Completed").length}{" "}
              completed
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="engineers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="engineers">Engineer Performance</TabsTrigger>
          <TabsTrigger value="sprints">Sprint Analytics</TabsTrigger>
          <TabsTrigger value="distribution">Task Distribution</TabsTrigger>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="engineers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Engineer Workload Distribution</CardTitle>
                <CardDescription>Tasks assigned per engineer</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={engineerStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="totalTasks"
                      fill="#8884d8"
                      name="Total Tasks"
                    />
                    <Bar
                      dataKey="completedTasks"
                      fill="#82ca9d"
                      name="Completed"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engineer Performance Table</CardTitle>
                <CardDescription>Detailed performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {engineerStats.map((engineer) => (
                    <div key={engineer.name} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{engineer.name}</h4>
                        <Badge variant="outline">
                          {engineer.completionRate.toFixed(1)}% completion
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Total Tasks:
                          </span>
                          <span className="ml-2 font-medium">
                            {engineer.totalTasks}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Completed:
                          </span>
                          <span className="ml-2 font-medium text-green-600">
                            {engineer.completedTasks}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            In Progress:
                          </span>
                          <span className="ml-2 font-medium text-blue-600">
                            {engineer.inProgressTasks}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Todo:</span>
                          <span className="ml-2 font-medium text-gray-600">
                            {engineer.todoTasks}
                          </span>
                        </div>
                      </div>
                      <Progress
                        value={engineer.completionRate}
                        className="mt-3"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sprints" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sprint Performance Overview</CardTitle>
              <CardDescription>
                Completion rates and task distribution across sprints
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={sprintPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sprintName" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="totalTasks" fill="#8884d8" name="Total Tasks" />
                  <Bar
                    dataKey="completedTasks"
                    fill="#82ca9d"
                    name="Completed Tasks"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {sprintPerformance.map((sprint) => (
              <Card key={sprint.sprintName}>
                <CardHeader>
                  <CardTitle className="text-lg">{sprint.sprintName}</CardTitle>
                  <CardDescription>
                    {sprint.duration} days duration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Completion Rate
                      </span>
                      <span className="font-semibold">
                        {sprint.completionRate.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={sprint.completionRate} />
                    <div className="flex justify-between text-sm">
                      <span>Completed: {sprint.completedTasks}</span>
                      <span>Total: {sprint.totalTasks}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Priority Distribution</CardTitle>
                <CardDescription>
                  Task distribution by priority level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={priorityDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name }) => `${name}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {priorityDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
                <CardDescription>Current task status breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name }) => `${name}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>
                Sprint completion rates over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={sprintPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sprintName" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="completionRate"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="Completion Rate (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Performance Indicators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Average Completion Rate
                  </span>
                  <Badge variant="secondary">
                    {sprintPerformance.length > 0
                      ? (
                          sprintPerformance.reduce(
                            (acc, sprint) => acc + sprint.completionRate,
                            0
                          ) / sprintPerformance.length
                        ).toFixed(1)
                      : "0.0"}
                    %
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Average Tasks per Sprint
                  </span>
                  <Badge variant="secondary">
                    {sprintPerformance.length > 0
                      ? (
                          sprintPerformance.reduce(
                            (acc, sprint) => acc + sprint.totalTasks,
                            0
                          ) / sprintPerformance.length
                        ).toFixed(1)
                      : "0.0"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Most Productive Engineer
                  </span>
                  <Badge variant="secondary">
                    {engineerStats.length > 0
                      ? engineerStats.reduce(
                          (prev, current) =>
                            prev.completedTasks > current.completedTasks
                              ? prev
                              : current,
                          engineerStats[0]
                        ).name
                      : "N/A"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Workload Balance</p>
                    <p className="text-muted-foreground">
                      Consider redistributing tasks for better balance
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Sprint Planning</p>
                    <p className="text-muted-foreground">
                      Current sprint completion rate is healthy
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Clock className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Time Management</p>
                    <p className="text-muted-foreground">
                      Focus on reducing tasks in review stage
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardPageLayout>
  );
}
