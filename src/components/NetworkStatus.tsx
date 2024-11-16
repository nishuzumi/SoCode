import { ForkManager } from "@/lib/vm";
import { atom, useAtom } from "jotai";
import { useState } from "react";
import { Address, Account, toBytes } from "@ethereumjs/util";
import { fetchFromProvider } from "@ethereumjs/util";
import { atomWithStorage } from 'jotai/utils';

// 定义RPC网络类型
export interface Network {
  name: string;
  rpc?: string;
  status: "active" | "inactive";
  chainId: number | null;
  postHook?: (forkManager: ForkManager) => void;
}

// 创建网络列表
export const networks: Network[] = [
  {
    name: "Local",
    rpc: undefined,
    status: "active",
    chainId: null,
  },
  {
    name: "Zircuit",
    rpc: "https://zircuit1-mainnet.p2pify.com/",
    status: "active",
    chainId: 58008,
  },
  {
    name: "Mantle",
    rpc: "https://rpc.mantle.xyz",
    status: "active",
    chainId: 5000,
  },
  {
    name: "Base",
    rpc: "https://sepolia.base.org",
    status: "active",
    chainId: 84532,
  },
  {
    name: "Scroll",
    rpc: "https://rpc.scroll.io",
    status: "active",
    chainId: 534352,
    postHook: async (forkManager) => {
      const rpcStateManager = forkManager.rpcStateManager;
      rpcStateManager.getAccountFromProvider = async function (
        address: Address
      ) {
        // @ts-ignore
        if (this.DEBUG) {
          // @ts-ignore
          this._debug(
            `retrieving account data from ${address.toString()} from provider`
          );
        }

        // @ts-ignore
        const accountData = await fetchFromProvider(this._provider, {
          method: "eth_getProof",
          // @ts-ignore
          params: [address.toString(), [], this._blockTag],
        });

        const account = Account.fromAccountData({
          balance: BigInt(accountData.balance),
          nonce: BigInt(accountData.nonce),
          codeHash: toBytes(accountData.keccakCodeHash), // change to keccakCodeHash because scroll :)
          storageRoot: toBytes(accountData.storageHash),
        });

        return account;
      };
    },
  },
  {
    name: "Arbitrum One",
    rpc: "https://arb1.arbitrum.io/rpc",
    status: "active",
    chainId: 42161,
  },
];

export const selectedNetworkAtom = atomWithStorage<Network>(
  'selected-network',
  networks[0],
  {
    getItem: (key: string) => {
      const stored = localStorage.getItem(key);
      if (!stored) return networks[0];
      
      try {
        const parsed = JSON.parse(stored);
        // 直接用 name 匹配原始配置
        return networks.find(n => n.name === parsed.name) || networks[0];
      } catch {
        return networks[0];
      }
    },
    setItem: (key: string, value: Network) => {
      // 只存储 name 就够了
      localStorage.setItem(key, JSON.stringify({ name: value.name }));
    },
    removeItem(key) {
      localStorage.removeItem(key)
    },
  }
)

selectedNetworkAtom.debugLabel = 'selectedNetworkAtom';

export function NetworkStatus() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useAtom(selectedNetworkAtom);

  return (
    <div className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900/50 rounded-full border border-neutral-800/50 cursor-pointer hover:bg-neutral-800/50"
      >
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        <span className="text-sm text-neutral-400">{selectedNetwork.name}</span>
      </div>

      {isOpen && (
        <div className="absolute top-full mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg z-50">
          {networks.map((network) => (
            <div
              key={network.name}
              className="px-4 py-2 hover:bg-neutral-800 cursor-pointer"
              onClick={() => {
                setSelectedNetwork(network);
                setIsOpen(false);
              }}
            >
              <span className="text-sm text-neutral-400">{network.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
