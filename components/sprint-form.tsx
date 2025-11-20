"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Sprint } from "@/types";

interface SprintFormProps {
  sprint?: Sprint;
  onSubmit: (sprintData: Partial<Sprint>) => void;
  trigger?: React.ReactNode;
}

export function SprintForm({ sprint, onSubmit, trigger }: SprintFormProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    sprintTitle: sprint?.sprintTitle || "",
    startDate: sprint?.startDate
      ? new Date(sprint.startDate).toISOString().split("T")[0]
      : "",
    endDate: sprint?.endDate
      ? new Date(sprint.endDate).toISOString().split("T")[0]
      : "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.sprintTitle.trim()) {
      newErrors.sprintTitle = "Sprint name is required";
    }
    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }
    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }
    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.startDate) >= new Date(formData.endDate)
    ) {
      newErrors.endDate = "End date must be after start date";
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
      ...(sprint?.$id && { $id: sprint.$id }), // Preserve ID for existing sprints
      ...formData,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
    });

    setOpen(false);
    if (!sprint) {
      // Reset form for new sprints
      setFormData({
        sprintTitle: "",
        startDate: "",
        endDate: "",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Create Sprint</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {sprint ? "Edit Sprint" : "Create New Sprint"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sprintTitle">Sprint Name</Label>
            <Input
              id="sprintTitle"
              value={formData.sprintTitle}
              onChange={(e) =>
                setFormData({ ...formData, sprintTitle: e.target.value })
              }
              placeholder="Enter sprint name"
              className={errors.sprintTitle ? "border-destructive" : ""}
            />
            {errors.sprintTitle && (
              <p className="text-sm text-destructive">{errors.sprintTitle}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              className={errors.startDate ? "border-destructive" : ""}
            />
            {errors.startDate && (
              <p className="text-sm text-destructive">{errors.startDate}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              className={errors.endDate ? "border-destructive" : ""}
            />
            {errors.endDate && (
              <p className="text-sm text-destructive">{errors.endDate}</p>
            )}
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
              {sprint ? "Update Sprint" : "Create Sprint"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
