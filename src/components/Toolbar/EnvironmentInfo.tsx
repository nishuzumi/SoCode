import { Database, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function EnvironmentInfo() {
  return (
    <div className="flex-1 flex items-center justify-center gap-4 border-l border-r border-neutral-800/50 px-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-2 text-neutral-400 hover:text-emerald-400 hover:bg-emerald-500/10"
          >
            <Database className="w-4 h-4" />
            <span>Compiler: 0.8.20</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Change Compiler Version</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-2 text-neutral-400 hover:text-blue-400 hover:bg-blue-500/10"
          >
            <Network className="w-4 h-4" />
            <span>Gas: 21000</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Gas Settings</TooltipContent>
      </Tooltip>
    </div>
  );
}
