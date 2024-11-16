import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ActionButtonProps {
  icon: LucideIcon;
  tooltip: string;
  onClick?: () => void;
  variant?: 'default' | 'ghost';
  colorClass?: string;
}

export function ActionButton({ 
  icon: Icon, 
  tooltip, 
  onClick, 
  colorClass = "hover:bg-blue-500/10 hover:text-blue-400"
}: ActionButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClick}
          className={`w-9 h-9 rounded-lg transition-colors ${colorClass}`}
        >
          <Icon className="w-4 h-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}