import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CodeCell } from './CodeCell';

export function Notebook() {
  // 预设两个 cells，一个成功一个失败
  const [cells] = useState<Array<{ id: string; status: 'success' | 'error' }>>([
    { id: 'cell-1', status: 'success' },
    { id: 'cell-2', status: 'error' }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 to-neutral-900">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 relative"
        >
          {/* Decorative elements */}
          <div className="absolute -top-8 -left-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -top-8 -right-8 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <Cpu className="w-8 h-8 text-blue-500" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                Solidity Jupyter
              </h1>
            </div>
            <p className="text-neutral-400 text-lg ml-11">
              Interactive Solidity development environment
            </p>
            
            {/* Stats/Info Cards */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-neutral-900/50 backdrop-blur-xl p-4 rounded-xl border border-neutral-800/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
              >
                <div className="text-blue-500 mb-2">Cells</div>
                <div className="text-2xl font-semibold">{cells.length}</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-neutral-900/50 backdrop-blur-xl p-4 rounded-xl border border-neutral-800/50 shadow-[0_0_15px_rgba(168,85,247,0.1)]"
              >
                <div className="text-purple-500 mb-2">Compiler</div>
                <div className="text-2xl font-semibold">0.8.24</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-neutral-900/50 backdrop-blur-xl p-4 rounded-xl border border-neutral-800/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
              >
                <div className="text-emerald-500 mb-2">Network</div>
                <div className="text-2xl font-semibold">Local</div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6 relative">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/50 to-purple-500/50 blur-[0.5px]"></div>
          
          {cells.map(({ id, status }) => (
            <CodeCell key={id} id={id} initialStatus={status} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8"
        >
          <Button
            variant="outline"
            className="w-full h-16 rounded-xl border-2 border-dashed border-neutral-800 hover:border-blue-500/50 hover:bg-blue-500/5 text-neutral-400 hover:text-blue-400 transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.05)] hover:shadow-[0_0_25px_rgba(59,130,246,0.1)]"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Cell
          </Button>
        </motion.div>
      </div>
    </div>
  );
}