import { Chain, Common } from "@ethereumjs/common";
import { VM } from "@ethereumjs/vm";
import { Address, Account } from "@ethereumjs/util";
import { ExecResult } from "@ethereumjs/evm";
import { fromBytes,createPublicClient, http, PublicClient, toHex } from "viem";
import { Source } from "./source";
import { RPCBlockChain, RPCStateManager } from '@ethereumjs/statemanager'
import { Network } from "@/components/NetworkStatus";
import { customVMHandler } from "./vm/precompile";
import { decodeConsoleLog } from "./contract/console";
import { parseConsoleLog } from "./contract/consoleLogger";

export const VM_ADDRESS = Address.fromString("0xffffffffffffffffffff00000000000000000000");
export type ForkManager = {
  blockchain: RPCBlockChain,
  rpcStateManager: RPCStateManager,
  rpcProvider: PublicClient,
}


const getForkManager = async (network?:Network) => {
  if (!network || !network.rpc) {
    return undefined
  }

  const rpcUrl = network.rpc; 
  const blockchain = new RPCBlockChain(rpcUrl)
  const rpcProvider = createPublicClient({
    transport: http(rpcUrl),
  })
  const latest = await rpcProvider.getBlockNumber()
  const rpcStateManager = new RPCStateManager({
    provider:rpcUrl,
    blockTag: latest,
  })
  network.postHook && network.postHook({
    blockchain,
    rpcStateManager,
    rpcProvider,
  })
  return {
    blockchain,
    rpcStateManager,
    rpcProvider,
  }
}

export class EthVM {
  blockchain!: RPCBlockChain;
  rpcStateManager!: RPCStateManager;
  rpcProvider!: PublicClient;
  vm!: VM;

  public consoleLogs: string[][] = [];
  protected constructor() { }

  static async create(network?:Network) {
    const vm = new EthVM();
    const struct = await getForkManager(network)
    if (struct) {
      vm.blockchain = struct.blockchain
      vm.rpcStateManager = struct.rpcStateManager
      vm.rpcProvider = struct.rpcProvider
    }
    vm.vm = await VM.create({
      common: new Common({ chain: Chain.Mainnet }),
      stateManager: vm.rpcStateManager,
      blockchain:vm.blockchain as any,
      evmOpts:{
        customPrecompiles:[
          {
            address: Address.fromString("0xf000000000000000000000000000000000000000"),
            function: customVMHandler
          }
        ]
      }
    })
    // vm.vm.evm.events?.on("step", (event) => {
    //   console.log(event)
    // })
    await vm.init()
    return vm;
  }

  private async init(){
    await this.loadConsole()
  }

  private async loadConsole(){
    this.vm.evm.events?.on('beforeMessage', (data) => {
      const log = parseConsoleLog(data)
      if (log) {
        this.consoleLogs.push(log)
      }
    })
  }

  async shadowClone() {
    const vm = new EthVM();
    vm.vm = await this.vm.shallowCopy();
    return vm;
  }

  async createMockAddr() {
    const account = Account.fromPartialAccountData({
      balance: 10n ** 18n,
    })
    const address = Address.fromString("0x1000000000000000000000000000000000000000");
    await this.vm.stateManager.putAccount(address, account);
    return address;
  }

  async deployContract(bytecode: Buffer, address: Address = VM_ADDRESS) {
    const result = await this.vm.evm.runCode({
      code: bytecode,
      gasLimit: 0x10000000000000000n,
    })

    if (result.exceptionError) {
      throw new Error(`Failed to deploy contract: ${result.exceptionError}`);
    }
    await this.vm.stateManager.putContractCode(address, result.returnValue);

    return address;
  }

  /**
   * Run the code with the given address and data
   * @param address 
   * @param data default is run()
   */
  async runCode(source: Source, withStop: boolean = true) {
    const result = await this.vm.evm.runCode({
      code: withStop ? await source.getBytecodeWithStop() : await source.getDeployedBytecode(),
      data:Buffer.from("c0406226","hex"),
      gasLimit: 0x10000000000000000n,
      value: 0n,
    })

    if (result.exceptionError) {
      throw result.exceptionError;
    }

    return result
  }
}

export function getStack(result: ExecResult) {
  return result.runState?.stack
}

export function getLastStackValue(result: ExecResult) {
  const offset = Number(getStack(result)?.getStack().pop())
  if (!offset) {
    throw new Error("stack is empty")
  }
  const memory = result.runState?.memory
  if (!memory) {
    throw new Error("memory is empty")
  }

  const lenData = memory.read(offset, 32)
  const len = fromBytes(lenData!, "bigint")
  const realData = memory.read(offset + 32, Number(len))
  return realData
}