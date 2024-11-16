import { selectedNetworkAtom } from "@/components/NetworkStatus";
import { type PrecompileInput, type ExecResult } from "@ethereumjs/evm";
import { getDefaultStore } from "jotai";
import { createPublicClient, http } from "viem";

const defaultStore = getDefaultStore();

export const customVMHandler = async (input: PrecompileInput) => {
    const store =  defaultStore.get(selectedNetworkAtom);
    console.log(store)
    let data = "0"
    if(store.rpc){
        const provider = createPublicClient({
            transport: http(store.rpc),
        });
        const result = await provider.getBalance({
            address:"0x0000000000000000000000000000000000000000"
        })
        data = result.toString(16)
    }
    return {
        returnValue: Buffer.from(data,'hex'),
        executionGasUsed: BigInt(1),
    }
}
