import { produce } from "immer";
import { useAtomCallback } from "jotai/utils";
import { useCallback, useState } from "react";
import { Source } from "@/lib/source";
import { CompiledContract, DecodeVariableResult, SourceType } from "@/types";
import { EthVM } from "@/lib/vm";
import { FragmentSnapshot, FragmentsAtom, LastFragmentSnapshot, RunIndexAtom, getCurrentFragment, FragmentData, FragmentsSnapshot } from "@/store/GlobalFragments";
import { selectedNetworkAtom } from "@/components/NetworkStatus";
import { Address } from "@ethereumjs/util";

function getSource(fragment?:FragmentSnapshot){
  if(!fragment) return new Source();
  return fragment.source.clone();
}
type RunCodeCallback = (uuid?: string) => Promise<void>;
export const useRunCode = (): [RunCodeCallback, boolean] => {
  const [loading, setLoading] = useState(false);
  return [useAtomCallback(
    useCallback(async (get, set, uuid?: string) => {
      if (uuid === undefined) return;
      const fragments = get(FragmentsAtom);
      const lastFragment = get(LastFragmentSnapshot);
      const runIndex = get(RunIndexAtom);
      const rpcUrl = get(selectedNetworkAtom);
      const fragment = getCurrentFragment(fragments, uuid)!;
      const updateCurrentFragment = (cb: (draft: FragmentData) => void) => {
        set(FragmentsAtom, (prev) => 
          produce(prev, (draft: FragmentData[]) => {
            const fragment = draft.find((v) => v.uuid === uuid)!;
            cb(fragment);
          })
        );
      };
      
      // 重建已经运行过的段的souce
      const source = getSource(lastFragment);

      updateCurrentFragment((draft) => {
        draft.result = undefined;
        draft.error = undefined;
        setLoading(true);
      })

      const vm = await EthVM.create(rpcUrl);

      try {
        const codes = fragment.code.trim().split("\n");
        switch (fragment.codeType) {
          case "globalcode":
            codes.unshift("//:GlobalCode")
            break;
          case "toplevelcode":
            codes.unshift("//:TopLevelCode")
            break;
        }

        const {
          type: type,
          source: newSource,
          variableMeta,
        } = await source.tryCompileNewCode(codes);

        const result = await vm.runCode(
          newSource,
          type === SourceType.VariableDeclaration
        );
        const {variable, value} = type === SourceType.VariableDeclaration ? await newSource.decodeVariable(
          result,
          variableMeta!
        ) : {} as DecodeVariableResult;

        updateCurrentFragment((draft) => {
          draft.result = {variable, value};

          if (!draft.detailCode) draft.detailCode = {}
          switch (type) {
            case SourceType.VariableDeclaration:
              draft.detailCode!.runnableCode = codes.slice(0, -1).join("\n");
              break;
            case SourceType.Normal:
              draft.detailCode!.runnableCode = draft.code;
              break;
          }
          draft.runIndex = runIndex;
          set(RunIndexAtom, runIndex + 1);
          set(FragmentsSnapshot, (draftSnapshots) => {
            return [...draftSnapshots, {
              ...draft,
              source: newSource,
              lastLogs: draftSnapshots[draftSnapshots.length - 1]?.logs ?? [],  
              logs: vm.consoleLogs,
              vm,
            }]
          })
          const scrollTo = draft.scrollTo;
          setTimeout(()=>{
            scrollTo?.();
          },10);
        });
      } catch (e: unknown) {
        console.log("error", e);
        if ((e as CompiledContract).errors) {
          updateCurrentFragment((draft) => {
            draft.error = (e as CompiledContract).errors;
          });
        }else{
          updateCurrentFragment((draft) => {
            draft.error = [e as any];
          });
        }
      }finally{
        setLoading(false);
      }
    }, [])
  ), loading];
};
