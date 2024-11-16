import { useState, useEffect, useRef, useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { useEffectOnce } from "react-use";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { solidity } from "@replit/codemirror-lang-solidity";
import { Play, Terminal, Code2, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { CodeTypeSelector } from "./CodeTypeSelector";
import { atom, PrimitiveAtom, useAtomValue, useSetAtom } from "jotai";
import { FragmentData } from "@/store/GlobalFragments";
import { useImmerAtom } from "jotai-immer";
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night";
import { CompileError, DecodeVariableResult } from "@/types";
import { useRunCode } from "@/hooks/useRunCode";

type CodeCellProps = {
  index: number;
  className?: string;
  fragmentAtom: PrimitiveAtom<FragmentData>;
};

export const GlobalSelect = atom<string | undefined>();
GlobalSelect.debugLabel = "GlobalSelect";

export function CodeCell({ index, className, fragmentAtom }: CodeCellProps) {
  const [fragment, setFragment] = useImmerAtom(fragmentAtom);
  const [codeType, setCodeType] = useState<
    "code" | "toplevelcode" | "globalcode"
  >("code");

  fragmentAtom.debugLabel = "FragmentAtomsAtom:" + index;

  const domRef = useRef<HTMLDivElement>(null);
  const setActive = useSetAtom(GlobalSelect);

  const runIndex = fragment.runIndex;

  // 是否折叠
  const isCollapsedAtom = useMemo(() => atom(false), []);
  const isCollapsed = useAtomValue(isCollapsedAtom);

  const truncateCode = (code: string, maxLength: number) => {
    return code.replace(/\n/g, " ").slice(0, maxLength) + "...";
  };

  const code = useMemo(() => {
    return isCollapsed ? truncateCode(fragment.code, 100) : fragment.code;
  }, [fragment.code, isCollapsed]);

  const [isEditorFocused, setIsEditorFocused] = useState(false);

  useEffectOnce(() => {
    setFragment((draft) => {
      draft.scrollTo = (position: "code" | "result" = "result") => {
        if (domRef.current) {
          const target =
            position === "result"
              ? domRef.current.querySelector(".view-tag")
              : domRef.current;
          target?.scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        }
      };
    });
  });

  const onChange = (value: string) => {
    setFragment((fragment) => {
      fragment.code = value;
    });
  };

  const status = useMemo(() => {
    if (fragment.error) return "error";
    if (fragment.result) return "success";
    return "idle";
  }, [fragment.error, fragment.result]);

  const runCode = useRunCode();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <div
        className={cn(
          "flex flex-col rounded-xl overflow-hidden border bg-neutral-900/50 backdrop-blur-xl transition-shadow duration-300 border-neutral-800/50",
          className,
          isEditorFocused &&
            (fragment.result
              ? "border-green-500/20 shadow-[0_0_25px_rgba(34,197,94,0.1)]"
              : fragment.error
              ? "border-red-500/20 shadow-[0_0_25px_rgba(239,68,68,0.1)]"
              : "border-blue-500/20 shadow-[0_0_25px_rgba(59,130,246,0.1)]")
        )}
      >
        {/* Code Editor Section */}
        <div className="flex-1 flex flex-col">
          <div className="bg-neutral-900/80 p-3 flex justify-between items-center border-b border-neutral-800/50">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-neutral-300">
                  [{runIndex ?? " "}] Fragment
                </span>
              </div>

              <CodeTypeSelector value={codeType} onChange={setCodeType} />
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  runCode(fragment.uuid);
                }}
                className={cn(
                  "transition-all duration-300 rounded-lg",
                  status === "idle" &&
                    "text-blue-500 hover:text-blue-400 hover:bg-blue-500/10",
                  // status === "running" &&
                  //   "text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10",
                  status === "success" &&
                    "text-green-500 hover:text-green-400 hover:bg-green-500/10",
                  status === "error" &&
                    "text-red-500 hover:text-red-400 hover:bg-red-500/10"
                )}
              >
                <Play className="w-4 h-4" />
              </Button>
              {/* <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete?.(id)}
                className="text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </Button> */}
            </div>
          </div>

          <div className="flex-1">
            <CodeMirror
              className="flex-grow"
              value={code}
              theme={tokyoNight}
              basicSetup={{
                lineNumbers: false,
                foldGutter: false,
              }}
              extensions={[solidity]}
              onChange={onChange}
              minHeight="20px"
              onFocus={() => {
                setIsEditorFocused(true);
                setActive(fragment.uuid);
              }}
              onBlur={() => {
                setIsEditorFocused(false);
                setActive(undefined);
              }}
            />
          </div>
        </div>

        {/* Results Section */}
        <FragmentResult fragment={fragment} status={status} />
      </div>
    </motion.div>
  );
}

function parseValue({ variable, value }: DecodeVariableResult) {
  if (typeof value === "bigint") {
    return value;
  }

  if (variable.typeDescriptions.typeString === "address") {
    return BigInt(value as string);
  }
}

export function FragmentResult({
  fragment,
  status,
}: {
  fragment: FragmentData;
  status: "idle" | "running" | "success" | "error";
}) {
  return (
    <AnimatePresence>
      {(fragment.result?.value || fragment.error) && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="border-t border-neutral-800/50"
        >
          <div className="bg-neutral-900/80 p-3 flex items-center gap-2 border-b border-neutral-800/50">
            <Terminal className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium text-neutral-300">
              Execution Results
            </span>
            <div
              className={cn(
                "ml-2 h-1.5 w-1.5 rounded-full transition-colors duration-300",
                fragment.error && "bg-red-500",
                // status === "running" && "bg-yellow-500",
                fragment.result && "bg-green-500"
              )}
            />
          </div>

          <div className="p-4 space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-neutral-400">
                <span>
                  {status === "error"
                    ? "Error Details"
                    : "Contract Interaction"}
                </span>
                <PlayCircle
                  className={cn(
                    "w-4 h-4",
                    status === "error" ? "text-red-500" : "text-emerald-500"
                  )}
                />
              </div>
              <pre
                className={cn(
                  "text-sm whitespace-pre-wrap font-mono bg-neutral-900/30 rounded-lg p-3 border transition-colors duration-300",
                  status === "error"
                    ? "border-red-500/20 bg-red-500/5 text-red-200"
                    : "border-neutral-800/50 text-neutral-300"
                )}
              >
                {fragment.result && (
                  <RenderResult
                    variable={fragment.result?.variable}
                    value={fragment.result?.value}
                  />
                )}
                {fragment.error && (
                  <ErrorMessage error={fragment.error} />
                )}
              </pre>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function RenderResult({ variable, value }: DecodeVariableResult) {
  if (!variable || value === undefined) return "";
  return (
    <div className="grid grid-cols-[auto,1fr] gap-x-4 text-sm font-mono">
      <span className="">Type</span>
      <div className="inline text-green-700">
        <span className="text-gray-700">: </span>
        {variable.typeDescriptions.typeString}
      </div>

      <span className="text-gray-700">Hex</span>
      <span className="inline text-red-700">
        <span className="text-gray-700">: </span>
        {parseValue({ variable, value })!.toString(16)}
      </span>

      <span className="text-gray-700">Decimal</span>
      <span className="inline text-red-700">
        <span className="text-gray-700">: </span>
        {parseValue({ variable, value })!.toString(10)}
      </span>

      <span className="text-gray-700">String</span>
      <span className="inline text-red-700">
        <span className="text-gray-700">: </span>
        {typeof value === "string" ? value : "Unknown"}
      </span>
    </div>
  );
}

const ErrorMessageSeverityColor: Record<string, string> = {
  error: "text-red-500",
  warning: "text-yellow-500",
  info: "text-blue-500",
};

export function ErrorMessage({ error }: { error: CompileError[] }) {
  return (
    <div className="mt-1">
      {error.map((e, index) => (
        <div key={index}>
          <pre
            className={cn("text-xs", ErrorMessageSeverityColor[e.severity])}
            dangerouslySetInnerHTML={{ __html: e.formattedMessage }}
          />
        </div>
      ))}
    </div>
  );
}