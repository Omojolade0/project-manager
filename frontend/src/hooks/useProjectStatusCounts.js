import { useState } from "react";
import projectService from "@/services/projectService";

const STATUSES = ["All", "Active", "Completed", "Inactive"];

export function useProjectStatusCounts() {
  const [counts, setCounts] = useState({});

  async function fetchCounts() {
    try {
      const results = await Promise.all(
        STATUSES.map((status) =>
          projectService.getProjects(1, 1, {
            status: status === "All" ? null : status,
          }),
        ),
      );
      const next = {};
      STATUSES.forEach((status, i) => {
        next[status] = results[i].total;
      });
      setCounts(next);
    } catch {
      // Pill counts are a non-critical enhancement; leave them blank on failure.
    }
  }

  return { counts, fetchCounts };
}
