import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface AddCellButtonProps {
  onClick?: () => void;
}

export function AddCellButton({ onClick }: AddCellButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-8"
    >
      <Button
        variant="outline"
        onClick={onClick}
        className="w-full h-16 rounded-xl border-2 border-dashed border-neutral-800 hover:border-blue-500/50 hover:bg-blue-500/5 text-neutral-400 hover:text-blue-400 transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.05)] hover:shadow-[0_0_25px_rgba(59,130,246,0.1)]"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add New Cell
      </Button>
    </motion.div>
  );
}