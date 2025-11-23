"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/contexts/app-context";
import { useTeams } from "@/contexts/teams-context";
import { useAuth } from "@/contexts/auth-context";
import { teams as teamsClient } from "@/lib/appwrite";
import type { Models } from "appwrite";
import type { Project, ProjectStatus } from "@/types";

const projectSchema = z
  .object({
    teamId: z.string().optional().nullable(),
    name: z
      .string()
      .min(3, "Name must be at least 3 characters")
      .max(120, "Name must be shorter than 120 characters"),
    description: z
      .string()
      .max(1000, "Description must be shorter than 1000 characters")
      .optional()
      .or(z.literal("")),
    ownerId: z.string().min(1, "Owner is required"),
    ownerName: z.string().optional(),
    status: z.custom<ProjectStatus>(),
    startDate: z.date().optional().nullable(),
    dueDate: z.date().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.dueDate) {
        return data.startDate <= data.dueDate;
      }
      return true;
    },
    {
      path: ["dueDate"],
      message: "Due date must be after start date",
    }
  );

export type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  trigger: ReactNode;
  project?: Project;
  title?: string;
  description?: string;
  onSubmit: (values: {
    teamId?: string | null;
    name: string;
    description?: string;
    ownerId: string;
    ownerName?: string;
    status: ProjectStatus;
    startDate?: string;
    dueDate?: string;
    isPrivate?: boolean;
  }) => Promise<void>;
}

export function ProjectForm({
  trigger,
  project,
  title,
  description,
  onSubmit,
}: ProjectFormProps) {
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState<Models.Membership[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { selectedTeamId } = useApp();
  const { teams } = useTeams();
  const { user } = useAuth();
  const { toast } = useToast();
  const isEditing = Boolean(project?.$id);

  const defaultValues = useMemo<Partial<ProjectFormValues>>(
    () => ({
      teamId: project?.teamId ?? selectedTeamId ?? null,
      name: project?.name ?? "",
      description: project?.description ?? "",
      ownerId: project?.ownerId ?? "",
      ownerName: project?.ownerName ?? "",
      status: project?.status ?? "Planned",
      startDate: project?.startDate ? new Date(project.startDate) : undefined,
      dueDate: project?.dueDate ? new Date(project.dueDate) : undefined,
    }),
    [project, selectedTeamId]
  );

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const teamSelection = form.watch("teamId");

  useEffect(() => {
    if (!open || !teamSelection) {
      setMembers([]);
      setLoadingMembers(false);
      return;
    }

    setLoadingMembers(true);
    teamsClient
      .listMemberships(teamSelection)
      .then((response) => {
        setMembers(response.memberships);
      })
      .catch((error) => {
        console.error("Failed to load team members", error);
        toast({
          title: "Unable to load members",
          description: "Check your connection and try again.",
          variant: "destructive",
        });
      })
      .finally(() => setLoadingMembers(false));
  }, [open, teamSelection, toast]);

  const ownerOptions = useMemo(() => {
    if (!teamSelection) {
      if (!user) return [];
      return [
        {
          id: user.$id,
          label: user.name || user.email || "You",
        },
      ];
    }

    if (!members.length) return [];
    return members.map((member) => ({
      id: member.userId,
      label: member.userName || member.userEmail || "Unknown user",
    }));
  }, [members, teamSelection, user]);

  useEffect(() => {
    if (!project && open) {
      if (!teamSelection && user) {
        form.setValue("ownerId", user.$id);
        form.setValue("ownerName", user.name || user.email || "You");
      } else if (ownerOptions.length > 0 && !form.getValues("ownerId")) {
        const owner = ownerOptions[0];
        form.setValue("ownerId", owner.id);
        form.setValue("ownerName", owner.label);
      }
    }
  }, [form, open, ownerOptions, project, teamSelection, user]);

  const handleSubmit = async (values: ProjectFormValues) => {
    const selectedOwner = ownerOptions.find(
      (member) => member.id === values.ownerId
    );
    const resolvedTeamId = values.teamId || null;
    const isPrivateProject = !resolvedTeamId;

    setIsSubmitting(true);
    try {
      await onSubmit({
        teamId: resolvedTeamId,
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
        ownerId: values.ownerId,
        ownerName: selectedOwner?.label,
        status: values.status,
        startDate: values.startDate?.toISOString(),
        dueDate: values.dueDate?.toISOString(),
        isPrivate: isPrivateProject,
      });
      toast({
        title: project ? "Project updated" : "Project created",
        description: project
          ? "The project details have been updated."
          : "New project added to your workspace.",
      });
      setOpen(false);
    } catch (error) {
      console.error("Project form submit error", error);
      toast({
        title: "Something went wrong",
        description: "We couldn't save the project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {title || (project ? "Edit Project" : "New Project")}
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FormField
              control={form.control}
              name="teamId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Context</FormLabel>
                  <Select
                    disabled={isEditing}
                    value={field.value ?? "__private__"}
                    onValueChange={(value) => {
                      if (value === "__private__") {
                        field.onChange(null);
                      } else {
                        field.onChange(value);
                      }
                      form.setValue("ownerId", "");
                      form.setValue("ownerName", "");
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select scope" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__private__">
                        Private (no team)
                      </SelectItem>
                      {teams.length === 0 && (
                        <SelectItem value="__no-team" disabled>
                          No teams available
                        </SelectItem>
                      )}
                      {teams.map((team) => (
                        <SelectItem key={team.$id} value={team.$id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Q1 Growth Initiative" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Key goals, scope, and milestones"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 lg:grid-cols-2">
              <FormField
                control={form.control}
                name="ownerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner</FormLabel>
                    <Select
                      disabled={loadingMembers || !teamSelection}
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        const owner = ownerOptions.find(
                          (option) => option.id === value
                        );
                        form.setValue("ownerName", owner?.label || "");
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              teamSelection
                                ? "Select owner"
                                : user
                                ? "Assigned to you"
                                : "Select owner"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ownerOptions.length === 0 ? (
                          <SelectItem value="__no-members" disabled>
                            {teamSelection
                              ? "No members found"
                              : "No owner available"}
                          </SelectItem>
                        ) : (
                          ownerOptions.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.label}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) =>
                        field.onChange(value as ProjectStatus)
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Planned">Planned</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="At Risk">At Risk</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            type="button"
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ?? undefined}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            type="button"
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ?? undefined}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {project ? "Save Changes" : "Create Project"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
