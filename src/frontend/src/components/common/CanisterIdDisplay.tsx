import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { getCanisterId } from '../../utils/canisterId';

export default function CanisterIdDisplay() {
  const [copied, setCopied] = useState(false);
  const canisterId = getCanisterId();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(canisterId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">
        Canister ID for NNS Hotkey
      </p>
      <div className="flex items-center gap-2">
        <code className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono text-foreground break-all border border-border">
          {canisterId}
        </code>
        <Button
          onClick={handleCopy}
          variant="outline"
          size="sm"
          className="gap-2 shrink-0"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy
            </>
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Use this canister ID as a hotkey principal in the NNS to allow this application to manage your neuron.
      </p>
    </div>
  );
}
