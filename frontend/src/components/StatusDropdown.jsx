import * as React from "react";

import LoadingSpinner from "@/components/common/LoadingSpinner";
import { STATUS_META } from "@/lib/taskStatus";
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

  const currentMeta = STATUS_META[currentStatus];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={updatingStatus}>
        <span
          className={`cursor-pointer text-caption font-medium px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 shrink-0 ${currentMeta?.tint || "bg-muted text-muted-foreground"}`}
        >
          {updatingStatus ? (
            <LoadingSpinner size="sm" className="border-current border-t-transparent" />
          ) : (
            <>
              <span className={`w-1.5 h-1.5 rounded-full ${currentMeta?.dot}`} />
              {currentMeta?.label || currentStatus}
            </>
          )}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-36" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Change Status</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={position} onValueChange={handleChange}>
            {statuses.map((status) => (
              <DropdownMenuRadioItem key={status} value={status}>
                <span className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_META[status]?.dot}`} />
                  {STATUS_META[status]?.label || status}
                </span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
