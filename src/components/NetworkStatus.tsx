import { atom, useAtom } from 'jotai';
import { useState } from 'react';

// 定义RPC网络类型
interface Network {
  name: string;
  rpc: string | null;
  status: 'active' | 'inactive';
  chainId: number | null;
}

// 创建网络列表
export const networks: Network[] = [
  { 
    name: 'Local', 
    rpc: null,
    status: 'active',
    chainId: null
  },
  { 
    name: 'Zircuit', 
    rpc: 'https://zircuit-rpc.com', // 请替换为实际的RPC地址
    status: 'active',
    chainId: 58008
  },
  { 
    name: 'Mantle', 
    rpc: 'https://rpc.mantle.xyz', 
    status: 'active',
    chainId: 5000
  },
  { 
    name: 'Base', 
    rpc: 'https://mainnet.base.org', 
    status: 'active',
    chainId: 8453
  },
  { 
    name: 'Scroll', 
    rpc: 'https://rpc.scroll.io', 
    status: 'active',
    chainId: 534352
  },
  { 
    name: 'Arbitrum One', 
    rpc: 'https://arb1.arbitrum.io/rpc', 
    status: 'active',
    chainId: 42161
  }
];

// 创建选中网络的atom
export const selectedNetworkAtom = atom<Network>(networks[0]);

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
              key={network.rpc}
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