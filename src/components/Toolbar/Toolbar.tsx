import { motion } from "framer-motion";
import { Play, RefreshCw, Upload, Download, Settings } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ActionButton } from "./ActionButton";
import { EnvironmentInfo } from "./EnvironmentInfo";

export function Toolbar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 flex gap-2 p-1 bg-neutral-900/50 backdrop-blur-xl rounded-lg border border-neutral-800/50 shadow-lg"
    >
      <TooltipProvider>
        {/* Left Section - Main Actions */}
        <div className="flex gap-1 p-1">
          <ActionButton
            icon={Play}
            tooltip="Run All Cells"
            colorClass="hover:bg-blue-500/10 hover:text-blue-400"
          />
          <ActionButton
            icon={RefreshCw}
            tooltip="Reset Environment"
            colorClass="hover:bg-purple-500/10 hover:text-purple-400"
          />
        </div>

        {/* Center Section - Environment Info */}
        <EnvironmentInfo />

        {/* Right Section - File Operations */}
        <div className="flex gap-1 p-1">
          <ActionButton
            icon={Upload}
            tooltip="Import Contract"
            colorClass="hover:bg-emerald-500/10 hover:text-emerald-400"
          />
          <ActionButton
            icon={Download}
            tooltip="Export Notebook"
            colorClass="hover:bg-blue-500/10 hover:text-blue-400"
          />
          <ActionButton
            icon={Settings}
            tooltip="Settings"
            colorClass="hover:bg-purple-500/10 hover:text-purple-400"
          />
        </div>
      </TooltipProvider>
    </motion.div>
  );
}
