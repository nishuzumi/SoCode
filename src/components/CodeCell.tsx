import { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { githubDark } from '@uiw/codemirror-theme-github';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, Trash2, Terminal, Code2, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CodeTypeSelector } from './CodeTypeSelector';

interface CodeCellProps {
  id: string;
  onDelete?: (id: string) => void;
  initialStatus?: 'success' | 'error';
}

const SAMPLE_CONTRACT = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Counter {
    uint256 private count;
    
    constructor() {
        count = 0;
    }
    
    function increment() public {
        count += 1;
    }
    
    function getCount() public view returns (uint256) {
        return count;
    }
}`;

const ERROR_CONTRACT = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BrokenCounter {
    uint256 private count;
    
    constructor() {
        count = 0;
    }
    
    function increment() public {
        // Unsafe arithmetic operation
        count = count + 1;
        require(false, "Always fails");
    }
    
    function getCount() public view returns (uint256) {
        return count;
    }
}`;

export function CodeCell({ id, onDelete, initialStatus = 'idle' }: CodeCellProps) {
  const [code, setCode] = useState(initialStatus === 'error' ? ERROR_CONTRACT : SAMPLE_CONTRACT);
  const [compilationOutput, setCompilationOutput] = useState('');
  const [executionOutput, setExecutionOutput] = useState('');
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>(initialStatus);
  const [height, setHeight] = useState('auto');
  const [codeType, setCodeType] = useState<'code' | 'toplevelcode' | 'globalcode'>('code');
  const [isEditorFocused, setIsEditorFocused] = useState(false);

  useEffect(() => {
    if (initialStatus === 'success') {
      setCompilationOutput(`Compilation successful!
Contract bytecode size: 324 bytes
Optimizer enabled: true (runs: 200)

Contract deployed to: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e
Transaction hash: 0x8b7934e74ef75b454acf41a4f9b4229d43eee29e1578e4f3bf9c1550c6a0e75b
Gas used: 123,456
Block: 14,356,789`);
      setExecutionOutput(`// Contract interaction results
> await counter.increment()
  ✓ Transaction confirmed
  Hash: 0x3a4b...7c8d
  Gas used: 34,562

> await counter.getCount()
  ← BigNumber { value: "1" }

// Events emitted
CounterIncremented(
  count: 1,
  timestamp: 1679234567
)

// Gas usage analysis
Function name     Gas used    USD equiv.
─────────────────────────────────────
increment         34,562      $0.52
getCount         21,234      $0.32

// Memory usage
Stack depth: 4
Memory expansion: 0x60 bytes
Storage slots written: 1`);
    } else if (initialStatus === 'error') {
      setCompilationOutput(`Error: CompileError: BrokenCounter.sol:14:9
require(false, "Always fails");
^------^
Error: Transaction reverted: Always fails
  --> BrokenCounter.sol:14:9:

Compilation failed with 1 error
Callstack:
  at Compiler.compile (solc/compiler.js:298:23)
  at Contract.deploy (ethereum/contract.js:145:12)
  at processTicksAndRejections (internal/process/task_queues.js:95:5)`);
      setExecutionOutput(`// Error trace
Error: Contract deployment failed
    at ContractFactory.deploy (contracts/factory.ts:234:12)
    at async deployContract (deploy.ts:56:23)
    
Stack trace:
  1. ContractFactory.deploy
  2. EtherscanProvider.sendTransaction
  3. JsonRpcProvider._wrapTransaction
  
Gas estimation failed: likely will revert
Reason: Always fails`);
    }
  }, [initialStatus]);

  useEffect(() => {
    const oneLineHeight = 19.59;
    const lines = code.split('\n').length;
    const calculatedHeight = Math.max(oneLineHeight, lines * oneLineHeight) + 8;
    setHeight(`${calculatedHeight}px`);
  }, [code]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <div className={cn(
        "flex flex-col rounded-xl overflow-hidden border bg-neutral-900/50 backdrop-blur-xl transition-shadow duration-300 border-neutral-800/50",
        isEditorFocused && (
          status === 'success' ? "border-green-500/20 shadow-[0_0_25px_rgba(34,197,94,0.1)]" :
          status === 'error' ? "border-red-500/20 shadow-[0_0_25px_rgba(239,68,68,0.1)]" :
          status === 'idle' ? "border-blue-500/20 shadow-[0_0_25px_rgba(59,130,246,0.1)]" :
          ""
        )
      )}>
        {/* Code Editor Section */}
        <div className="flex-1 flex flex-col">
          <div className="bg-neutral-900/80 p-3 flex justify-between items-center border-b border-neutral-800/50">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-neutral-300">Contract Code</span>
              </div>
              
              <CodeTypeSelector value={codeType} onChange={setCodeType} />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {}}
                className={cn(
                  "transition-all duration-300 rounded-lg",
                  status === 'idle' && "text-blue-500 hover:text-blue-400 hover:bg-blue-500/10",
                  status === 'running' && "text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10",
                  status === 'success' && "text-green-500 hover:text-green-400 hover:bg-green-500/10",
                  status === 'error' && "text-red-500 hover:text-red-400 hover:bg-red-500/10"
                )}
              >
                <Play className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete?.(id)}
                className="text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex-1">
            <CodeMirror
              value={code}
              height={height}
              theme={githubDark}
              extensions={[javascript({ jsx: true })]}
              onChange={(value) => setCode(value)}
              className="text-sm"
              onFocus={() => setIsEditorFocused(true)}
              onBlur={() => setIsEditorFocused(false)}
            />
          </div>
        </div>

        {/* Results Section */}
        <AnimatePresence>
          {(compilationOutput || executionOutput) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-neutral-800/50"
            >
              <div className="bg-neutral-900/80 p-3 flex items-center gap-2 border-b border-neutral-800/50">
                <Terminal className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium text-neutral-300">Execution Results</span>
                <div className={cn(
                  "ml-2 h-1.5 w-1.5 rounded-full transition-colors duration-300",
                  status === 'idle' && "bg-neutral-500",
                  status === 'running' && "bg-yellow-500",
                  status === 'success' && "bg-green-500",
                  status === 'error' && "bg-red-500"
                )} />
              </div>

              <div className="p-4 space-y-4">
                {/* Compilation Output */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-neutral-400">
                    <span>Compilation {status === 'error' ? 'Error' : 'Output'}</span>
                  </div>
                  <motion.pre
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                      "text-sm whitespace-pre-wrap font-mono bg-neutral-900/30 rounded-lg p-3 border transition-colors duration-300",
                      status === 'error' 
                        ? "border-red-500/20 bg-red-500/5 text-red-200"
                        : "border-neutral-800/50 text-neutral-300"
                    )}
                  >
                    {compilationOutput || 'No compilation output yet'}
                  </motion.pre>
                </div>

                {/* Execution Output */}
                {executionOutput && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center gap-2 text-sm font-medium text-neutral-400">
                      <span>{status === 'error' ? 'Error Details' : 'Contract Interaction'}</span>
                      <PlayCircle className={cn(
                        "w-4 h-4",
                        status === 'error' ? "text-red-500" : "text-emerald-500"
                      )} />
                    </div>
                    <pre className={cn(
                      "text-sm whitespace-pre-wrap font-mono bg-neutral-900/30 rounded-lg p-3 border transition-colors duration-300",
                      status === 'error'
                        ? "border-red-500/20 bg-red-500/5 text-red-200"
                        : "border-neutral-800/50 text-neutral-300"
                    )}>
                      {executionOutput}
                    </pre>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}