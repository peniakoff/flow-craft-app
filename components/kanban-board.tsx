"use client";

import { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { priorityColors } from "@/lib/data";
import type { Issue, IssueStatus, Sprint } from "@/types";

interface KanbanBoardProps {
  sprint: Sprint;
  issues: Issue[];
  onUpdateIssueStatus: (issueId: string, newStatus: IssueStatus) => void;
}

const columns: { id: IssueStatus; title: string; color: string }[] = [
  { id: "Todo", title: "Todo", color: "bg-muted border-muted" },
  {
    id: "In Progress",
    title: "In Progress",
    color: "bg-primary/5 border-primary/20",
  },
  {
    id: "In Review",
    title: "In Review",
    color: "bg-secondary/50 border-secondary",
  },
  { id: "Done", title: "Done", color: "bg-accent/30 border-accent" },
];

export function KanbanBoard({
  sprint,
  issues,
  onUpdateIssueStatus,
}: KanbanBoardProps) {
  const [mounted, setMounted] = useState(false);
  const [sprintIssues, setSprintIssues] = useState<Issue[]>([]);

  useEffect(() => {
    setMounted(true);
    setSprintIssues(issues.filter((issue) => issue.sprintId === sprint.$id));
  }, [issues, sprint.$id]);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as IssueStatus;
    onUpdateIssueStatus(draggableId, newStatus);
  };

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Kanban Board</h2>
          <p className="text-sm text-muted-foreground">{sprint.sprintTitle}</p>
        </div>
        <Badge variant="outline">{sprintIssues.length} issues</Badge>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column) => {
            const columnIssues = sprintIssues.filter(
              (issue) => issue.status === column.id
            );

            return (
              <div key={column.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm">{column.title}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {columnIssues.length}
                  </Badge>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[200px] p-3 rounded-lg border-2 border-dashed transition-colors ${
                        column.color
                      } ${
                        snapshot.isDraggingOver
                          ? "border-primary bg-primary/5"
                          : "border-muted"
                      }`}
                    >
                      <div className="space-y-3">
                        {columnIssues.map((issue, index) => (
                          <Draggable
                            key={issue.$id || index}
                            draggableId={issue.$id || String(index)}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <Card
                                  className={`cursor-grab active:cursor-grabbing transition-shadow ${
                                    snapshot.isDragging
                                      ? "shadow-lg rotate-2"
                                      : "hover:shadow-md"
                                  }`}
                                >
                                  <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-mono text-muted-foreground">
                                            {issue.$id}
                                          </span>
                                          <Badge
                                            className={
                                              priorityColors[issue.priority]
                                            }
                                            variant="secondary"
                                          >
                                            P{issue.priority}
                                          </Badge>
                                        </div>
                                        <h4 className="font-medium text-sm leading-tight line-clamp-2">
                                          {issue.title}
                                        </h4>
                                      </div>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="pt-0">
                                    {issue.description && (
                                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                        {issue.description}
                                      </p>
                                    )}
                                    <div className="flex items-center justify-between">
                                      {issue.assignedUserId && (
                                        <span className="text-xs text-muted-foreground">
                                          Assigned
                                        </span>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      </div>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {sprintIssues.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No issues assigned to this sprint yet.
          </p>
        </div>
      )}
    </div>
  );
}
