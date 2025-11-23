"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { useTeams } from "@/contexts/teams-context";
import type { Team } from "@/types/teams.types";
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
  const { teams, teamsCount, getTeam } = useTeams();
  const [currentTeam, setCurrentTeam] = useState<Team | undefined>(
    teams.find((team) => team.$id === selectedTeamId)
  );

  // Fetch team details if selectedTeamId exists but isn't in the teams list
  useEffect(() => {
    const foundTeam = teams.find((team) => team.$id === selectedTeamId);

    if (foundTeam) {
      setCurrentTeam(foundTeam);
    } else if (selectedTeamId) {
      // Team not in list, fetch it directly (user might be invited member)
      getTeam(selectedTeamId)
        .then((team) => {
          setCurrentTeam(team);
        })
        .catch((error) => {
          console.error("Failed to fetch selected team:", error);
          setCurrentTeam(undefined);
        });
    } else {
      setCurrentTeam(undefined);
    }
  }, [selectedTeamId, teams, getTeam]);

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {currentTeam && (
          <>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <Badge
                variant="outline"
                className="flex items-center gap-1 shrink-0"
              >
                <Users className="h-3 w-3" />
                <span className="truncate">{currentTeam.name}</span>
              </Badge>
              <span className="text-muted-foreground text-xs shrink-0 hidden sm:inline">
                {teamsCount === 1 ? "1 team" : `${teamsCount} teams`} available
              </span>
            </div>
          </>
        )}
      </div>
      <div className="flex gap-2 shrink-0">
        <Select
          value={selectedTeamId ?? "none"}
          onValueChange={(value) =>
            setSelectedTeamId(value === "none" ? null : value)
          }
        >
          <SelectTrigger className="w-[180px] sm:w-[220px]">
            <SelectValue placeholder="Choose team" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No team selected</SelectItem>
            {/* Show current team if it's not in the teams list (invited member) */}
            {currentTeam && !teams.find((t) => t.$id === currentTeam.$id) && (
              <SelectItem key={currentTeam.$id} value={currentTeam.$id}>
                {currentTeam.name}
              </SelectItem>
            )}
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
