import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FolderClosed } from 'lucide-react';



function StatsIcon({ title, number }) {

  return (
    <Card className="w-[270px] flex justify-start gap-5 p-5">
      <div className="ml-4 mt-5 border h-7  ">
        <FolderClosed />
      </div>
      <div className="flex flex-col gap-1">
        <CardTitle className="text-xl">{title}</CardTitle>
        <h2 className="text-3xl font-semibold">{number}</h2>
        <p>+1 this week</p>
      </div>
    </Card>
  )
};

export default StatsIcon
