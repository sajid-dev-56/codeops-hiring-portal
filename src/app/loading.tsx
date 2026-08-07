import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-500">
      <div className="relative">
        <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full" />
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin relative z-10" />
      </div>
      <p className="text-surface-500 dark:text-surface-400 font-medium animate-pulse">
        Loading...
      </p>
    </div>
  );
}
