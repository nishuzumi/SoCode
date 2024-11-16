import { selectedNetworkAtom } from "@/components/NetworkStatus";
import { type PrecompileInput, type ExecResult } from "@ethereumjs/evm";
import { getDefaultStore } from "jotai";
import { createPublicClient, createWalletClient, decodeFunctionData, encodeFunctionResult, hexToBytes, http, numberToBytes, parseAbi, toHex } from "viem";
import { InterpreterStep, Message, EVMResult } from '@ethereumjs/evm'
import { VM } from "@ethereumjs/vm";
import { Address } from "@ethereumjs/util";
import { Account } from "@ethereumjs/util";
import { EthVM } from "../vm";
import { privateKeyToAccount } from "viem/accounts";
const defaultStore = getDefaultStore();

export class CustomPrecompile {
  broadcast: {
    enabled: boolean;
    once: boolean;
    privateKey: bigint;
  } = {
      enabled: false,
      once: false,
      privateKey: BigInt(0)
    };
  vm!: EthVM;

  public async customVMHandler(input: PrecompileInput) {
    console.log("input", input)
    switch (toHex(input.data.slice(0, 4))) {
      case "0xf67a965b": // broadcast(uint256 privateKey)
        return this.onBoardcast(input)
    }

    return {
      returnValue: Buffer.from("0x", 'hex'),
      executionGasUsed: BigInt(1),
    }
  }

  async onStepHook(event: InterpreterStep) {
    // if (['CALL', 'CREATE', 'CREATE2'].includes(event.opcode.name)) {
    //     await this.handleExternalCall(event)
    // }
  }

  async onAfterMessage(event: EVMResult) {
    console.log("onAfterMessage", event)
  }

  async onBeforeMessage(event: Message) {
    if (this.broadcast.enabled) {
      if (this.broadcast.once) {
        this.broadcast.enabled = false
      }
      const caller = Address.fromPrivateKey(numberToBytes(this.broadcast.privateKey, { size: 32 }));
      let callerAccount;
      if (!callerAccount) {
        callerAccount = await this.vm.vm.stateManager.getAccount(caller)
      }
      if (!callerAccount) {
        callerAccount = new Account()
      }
      callerAccount.nonce++
      console.log("callerAccount", callerAccount)
      await this.vm.vm.stateManager.putAccount(caller, callerAccount)
      // @ts-ignore
      event.caller.bytes = caller.bytes
      console.log("broadcast caller", event) 

      const rpc = defaultStore.get(selectedNetworkAtom)
      if (!rpc) {
        return
      }

      const key = toHex(this.broadcast.privateKey)

      const wallet = createWalletClient({
        account: privateKeyToAccount(key),
        transport: http(rpc.rpc!)
      })

      const transaction = await wallet.sendTransaction({
        from: event.caller.toString(),
        to: null,
        data: toHex(event.code as Uint8Array),
        value: event.value,  // 直接使用 bigint 值，不需要转换为十六进
        chain: null
      })

      this.vm.consoleLogs.push([`broadcast transaction:`, transaction])
    }
  }
  
  private async handleExternalCall(event: InterpreterStep) {
    if (this.broadcast.enabled) {
      await this.broadcastCall(event)
      console.log("broadcast call")
    }
  }

  private async broadcastCall(event: InterpreterStep) {
    if (event.opcode.name === "CREATE2") {
      console.log("CREATE2 detected:", event)
      return
    }
    if (event.opcode.name === 'CREATE') {
      const [value, memoryOffset, length] = [event.stack.pop()!, event.stack.pop()!, event.stack.pop()!]

      // 从内存中获取实际的合约字节码
      const bytecode = event.memory.slice(
        Number(memoryOffset),    // memoryOffset
        Number(memoryOffset) + Number(length)  // memoryOffset + length
      )

      // 构造标准的交易格式
      const transaction = {
        from: '0x' + event.address.toString(),
        // CREATE 不需要 to 地址
        to: null,
        data: '0x' + bytecode.toString(),
        value: `0x${value.toString(16)}`,  // 转换为十六进制字符串
      }

      console.log('Transaction format for contract deployment:', transaction)
    }
  }

  private async onBoardcast(input: PrecompileInput) {
    const abi = parseAbi([
      'function broadcast(uint256 privateKey) external returns (bool)'
    ]);
    const { args } = decodeFunctionData({
      abi,
      data: toHex(input.data)
    })
    this.broadcast = {
      enabled: true,
      once: true,
      privateKey: args[0]
    }


    return {
      returnValue: hexToBytes(encodeFunctionResult({
        abi,
        functionName: "broadcast",
        result: true
      })),
      executionGasUsed: BigInt(1),
    }
  }
}