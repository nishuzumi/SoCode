import { useState } from 'react';
import { motion } from 'framer-motion';
import { CodeCell } from './CodeCell';
import { Logo } from './Logo';
import { NetworkStatus } from './NetworkStatus';
import { Toolbar } from './Toolbar/Toolbar';
import { AddCellButton } from './AddCellButton';

export function Notebook() {
  const [cells] = useState<Array<{ id: string; status: 'success' | 'error' }>>([
    { id: 'cell-1', status: 'success' },
    { id: 'cell-2', status: 'error' }
  ]);

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
          {cells.map(({ id, status }) => (
            <CodeCell key={id} id={id} initialStatus={status} />
          ))}
        </div>

        <AddCellButton />
      </div>
    </div>
  );
}