"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { Issue, IssueStatus, Sprint } from "@/types";
import { useApp } from "@/contexts/app-context";
import { teams } from "@/lib/appwrite";
import type { Models } from "appwrite";

interface IssueFormProps {
  issue?: Issue;
  sprints: Sprint[];
  onSubmit: (issueData: Partial<Issue>) => void;
  trigger?: React.ReactNode;
}

export function IssueForm({
  issue,
  sprints,
  onSubmit,
  trigger,
}: IssueFormProps) {
  const [open, setOpen] = useState(false);
  const { selectedTeamId } = useApp();
  const [teamMembers, setTeamMembers] = useState<Models.Membership[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const [formData, setFormData] = useState({
    title: issue?.title || "",
    description: issue?.description || "",
    priority: issue?.priority || 3,
    status: issue?.status || ("Todo" as IssueStatus),
    assignedUserId: issue?.assignedUserId || "",
    sprintId: issue?.sprintId || "0",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch team members when dialog opens and team is selected
  useEffect(() => {
    if (open && selectedTeamId) {
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
  }, [open, selectedTeamId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit({
      ...(issue?.$id && { $id: issue.$id }), // Preserve ID for existing issues
      ...formData,
      sprintId: formData.sprintId === "0" ? undefined : formData.sprintId,
      assignedUserId: formData.assignedUserId || undefined,
    });

    setOpen(false);
    if (!issue) {
      // Reset form for new issues
      setFormData({
        title: "",
        description: "",
        priority: 3,
        status: "Todo",
        assignedUserId: "",
        sprintId: "0",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Create Issue</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{issue ? "Edit Issue" : "Create New Issue"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter issue title"
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter issue description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={String(formData.priority)}
                onValueChange={(value) =>
                  setFormData({ ...formData, priority: Number(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">P1 - Critical</SelectItem>
                  <SelectItem value="2">P2 - High</SelectItem>
                  <SelectItem value="3">P3 - Normal</SelectItem>
                  <SelectItem value="4">P4 - Low</SelectItem>
                  <SelectItem value="5">P5 - Lowest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: IssueStatus) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todo">Todo</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="In Review">In Review</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignee">Assignee (Optional)</Label>
            <Select
              value={formData.assignedUserId || "unassigned"}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  assignedUserId: value === "unassigned" ? "" : value,
                })
              }
              disabled={loadingMembers}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loadingMembers ? "Loading members..." : "Select assignee"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {teamMembers.map((member) => (
                  <SelectItem key={member.userId} value={member.userId}>
                    {member.userName} ({member.userEmail})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sprint">Sprint (Optional)</Label>
            <Select
              value={formData.sprintId}
              onValueChange={(value) =>
                setFormData({ ...formData, sprintId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sprint" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">No Sprint (Backlog)</SelectItem>
                {sprints.map((sprint) => (
                  <SelectItem key={sprint.$id} value={sprint.$id || ""}>
                    {sprint.sprintTitle} ({sprint.sprintStatus})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {issue ? "Update Issue" : "Create Issue"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
