export function NetworkStatus() {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900/50 rounded-full border border-neutral-800/50">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        <span className="text-sm text-neutral-400">Local Network</span>
      </div>
    );
  }