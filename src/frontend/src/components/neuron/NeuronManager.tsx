import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useGetCallerUserProfile, useSaveNeuronId } from '../../hooks/useQueries';
import { Principal } from '@dfinity/principal';
import { Loader2, Save, Plus, Trash2, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import CanisterIdDisplay from '../common/CanisterIdDisplay';

export default function NeuronManager() {
  const { data: userProfile } = useGetCallerUserProfile();
  const saveNeuronId = useSaveNeuronId();

  const [neuronId, setNeuronId] = useState('');
  const [hotkeyPrincipal, setHotkeyPrincipal] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [actionType, setActionType] = useState<'add' | 'remove'>('add');
  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Initialize neuronId from userProfile when it loads or changes
  useEffect(() => {
    if (userProfile?.selectedNeuronId) {
      setNeuronId(userProfile.selectedNeuronId);
    }
  }, [userProfile?.selectedNeuronId]);

  const handleSaveNeuronId = async () => {
    if (!neuronId.trim()) {
      setValidationError('Please enter a neuron ID');
      return;
    }

    try {
      await saveNeuronId.mutateAsync(neuronId.trim());
      setSuccessMessage('Neuron ID saved successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setValidationError(error.message || 'Failed to save neuron ID');
    }
  };

  const validatePrincipal = (principal: string): boolean => {
    try {
      Principal.fromText(principal);
      return true;
    } catch {
      return false;
    }
  };

  const handleOpenAddDialog = () => {
    setValidationError('');
    setActionType('add');
    if (!neuronId.trim()) {
      setValidationError('Please save a neuron ID first');
      return;
    }
    if (!hotkeyPrincipal.trim()) {
      setValidationError('Please enter a principal ID');
      return;
    }
    if (!validatePrincipal(hotkeyPrincipal)) {
      setValidationError('Invalid principal ID format');
      return;
    }
    setShowAddDialog(true);
  };

  const handleOpenRemoveDialog = () => {
    setValidationError('');
    setActionType('remove');
    if (!neuronId.trim()) {
      setValidationError('Please save a neuron ID first');
      return;
    }
    if (!hotkeyPrincipal.trim()) {
      setValidationError('Please enter a principal ID');
      return;
    }
    if (!validatePrincipal(hotkeyPrincipal)) {
      setValidationError('Invalid principal ID format');
      return;
    }
    setShowRemoveDialog(true);
  };

  const handleConfirmAction = async () => {
    setShowAddDialog(false);
    setShowRemoveDialog(false);
    setValidationError('');
    setSuccessMessage('');

    // Show informational message about manual hotkey management
    setSuccessMessage(
      `To ${actionType} this hotkey, please use the NNS dapp at nns.ic0.app. This app helps you track your neuron configuration but does not directly manage hotkeys.`
    );
    
    setHotkeyPrincipal('');
    setTimeout(() => setSuccessMessage(''), 8000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Alert className="border-blue-500/50 bg-blue-500/10">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-600 text-sm">
          <strong>Note:</strong> This app helps you configure which neuron to use for proposals. 
          To actually add or remove hotkeys, please use the{' '}
          <a
            href="https://nns.ic0.app"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-blue-700 font-medium"
          >
            NNS dapp
          </a>.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Neuron Configuration</CardTitle>
          <CardDescription>
            Select the neuron you want to use for submitting proposals. You must be the controller of this neuron.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="neuronId">Neuron ID</Label>
            <div className="flex gap-2">
              <Input
                id="neuronId"
                placeholder="Enter your neuron ID (e.g., 12345678901234567890)"
                value={neuronId}
                onChange={(e) => {
                  setNeuronId(e.target.value);
                  setValidationError('');
                }}
                className="flex-1"
              />
              <Button
                onClick={handleSaveNeuronId}
                disabled={saveNeuronId.isPending}
                className="gap-2"
              >
                {saveNeuronId.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save
              </Button>
            </div>
            {userProfile?.selectedNeuronId && (
              <p className="text-xs text-muted-foreground">
                Current: {userProfile.selectedNeuronId}
              </p>
            )}
          </div>

          {successMessage && (
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">{successMessage}</AlertDescription>
            </Alert>
          )}

          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hotkey Reference</CardTitle>
          <CardDescription>
            Information about hotkey management for your neuron. Hotkeys can vote and follow on behalf of the neuron but cannot submit proposals or disburse funds.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hotkeyPrincipal">Hotkey Principal (Reference)</Label>
            <Input
              id="hotkeyPrincipal"
              placeholder="Enter principal ID (e.g., xxxxx-xxxxx-xxxxx-xxxxx-cai)"
              value={hotkeyPrincipal}
              onChange={(e) => {
                setHotkeyPrincipal(e.target.value);
                setValidationError('');
              }}
            />
            <p className="text-xs text-muted-foreground">
              Use this to validate principal format before adding it via the NNS dapp
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleOpenAddDialog}
              className="flex-1 gap-2"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
              Add Hotkey Info
            </Button>
            <Button
              onClick={handleOpenRemoveDialog}
              variant="outline"
              className="flex-1 gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Remove Hotkey Info
            </Button>
          </div>

          <Separator />

          <CanisterIdDisplay />

          <Separator />

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs space-y-2">
              <p>
                <strong>Important:</strong> You must be the controller of the neuron to manage hotkeys.
              </p>
              <p>
                To add or remove hotkeys, visit the{' '}
                <a
                  href="https://nns.ic0.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary font-medium"
                >
                  NNS dapp
                </a>
                , select your neuron, and use the hotkey management interface.
              </p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <AlertDialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add Hotkey via NNS Dapp</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>To add the following hotkey to your neuron:</p>
              <div className="bg-muted p-3 rounded-md text-sm font-mono break-all">
                {hotkeyPrincipal}
              </div>
              <p className="text-xs">
                Neuron ID: <span className="font-mono">{neuronId}</span>
              </p>
              <Separator />
              <div className="space-y-2 text-sm">
                <p className="font-medium">Steps:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Go to <a href="https://nns.ic0.app" target="_blank" rel="noopener noreferrer" className="underline">nns.ic0.app</a></li>
                  <li>Select your neuron (ID: {neuronId})</li>
                  <li>Navigate to the hotkey management section</li>
                  <li>Add the principal: {hotkeyPrincipal}</li>
                </ol>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>Got it</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Hotkey via NNS Dapp</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>To remove the following hotkey from your neuron:</p>
              <div className="bg-muted p-3 rounded-md text-sm font-mono break-all">
                {hotkeyPrincipal}
              </div>
              <p className="text-xs">
                Neuron ID: <span className="font-mono">{neuronId}</span>
              </p>
              <Separator />
              <div className="space-y-2 text-sm">
                <p className="font-medium">Steps:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Go to <a href="https://nns.ic0.app" target="_blank" rel="noopener noreferrer" className="underline">nns.ic0.app</a></li>
                  <li>Select your neuron (ID: {neuronId})</li>
                  <li>Navigate to the hotkey management section</li>
                  <li>Remove the principal: {hotkeyPrincipal}</li>
                </ol>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>Got it</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
