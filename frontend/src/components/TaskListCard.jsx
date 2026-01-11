
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, Clock9 } from "lucide-react";

function TaskListCard() {


  return (
    <Card className="min-w-min rounded-xl border shadow-sm m-6 flex justify-center items-center" >
      <CardHeader className="pb-2 mb-2">
        <CardTitle className="text-lg">Task Name</CardTitle>
        <CardDescription className="mt-1">
          This is where the project description stays
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-14 ">
        {/* Status + Date row */}
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary" className="rounded-md">
            In Progress
          </Badge>
          <Badge variant="secondary" className="rounded-md">
            Priority
          </Badge>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock9 className="h-4 w-4" />
            <span>20 Jan</span>
          </div>
        </div>
      </CardContent>
    </Card >
  )
}
export default TaskListCard