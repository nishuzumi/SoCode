import { useState } from "react";
import { motion } from "framer-motion";
import { CodeCell } from "./CodeCell";
import { Logo } from "./Logo";
import { NetworkStatus } from "./NetworkStatus";
import { Toolbar } from "./Toolbar/Toolbar";
import { AddCellButton } from "./AddCellButton";
import { useAtom, useSetAtom } from "jotai";
import { AddFragment, FragmentAtomsAtom, FragmentData } from "@/store/GlobalFragments";

export function Notebook() {
  const [fragmentAtoms] = useAtom(FragmentAtomsAtom);
  const addFragment = useSetAtom(AddFragment);

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 to-neutral-900">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header with Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6 relative"
        >
          <Logo />
          <NetworkStatus />
        </motion.div>

        <Toolbar />

        {/* Code Cells */}
        <div className="space-y-6 relative">
          {fragmentAtoms.map((fragmentAtom, index) => (
            <CodeCell
              className="mb-2"
              key={(fragmentAtom as unknown as FragmentData).uuid}
              fragmentAtom={fragmentAtom}
              index={index}
            />
          ))}
        </div>

        <AddCellButton onClick={() => addFragment()} />
      </div>
    </div>
  );
}
