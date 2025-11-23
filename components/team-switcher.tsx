"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { useTeams } from "@/contexts/teams-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function TeamSwitcher() {
  const { selectedTeamId, setSelectedTeamId } = useApp();
  const { teams, teamsCount } = useTeams();

  const currentTeam = teams.find((team) => team.$id === selectedTeamId);

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between h-[42px]">
      <div className="space-y-1">
        {currentTeam && (
          <>
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Working Team
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {currentTeam.name}
              </Badge>
              <span className="text-muted-foreground">
                {teamsCount === 1 ? "1 team" : `${teamsCount} teams`} available
              </span>
            </div>
          </>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Select
          value={selectedTeamId ?? "none"}
          onValueChange={(value) =>
            setSelectedTeamId(value === "none" ? null : value)
          }
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Choose team" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No team selected</SelectItem>
            {teams.map((team) => (
              <SelectItem key={team.$id} value={team.$id}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="h-9" asChild>
          <Link href="/dashboard/teams">Manage teams</Link>
        </Button>
      </div>
    </div>
  );
}
