import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function StatusDropdown({
  currentStatus,
  statuses,
  onStatusChange,
  statusStyles,
  updatingStatus,
}) {
  const [position, setPosition] = React.useState(currentStatus);
  React.useEffect(() => {
    setPosition(currentStatus);
  }, [currentStatus]);

  function handleChange(newStatus) {
    setPosition(newStatus);
    onStatusChange(newStatus);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={updatingStatus}>
        <span
          className={`cursor-pointer text-xs font-medium px-2.5 py-1 rounded-lg ${statusStyles[currentStatus]}`}
        >
          {updatingStatus
            ? "Updating..."
            : currentStatus === "Inprogress"
              ? "In Progress"
              : currentStatus}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-32">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Change Status</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={position} onValueChange={handleChange}>
            {statuses.map((status) => (
              <DropdownMenuRadioItem key={status} value={status}>
                {status}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
