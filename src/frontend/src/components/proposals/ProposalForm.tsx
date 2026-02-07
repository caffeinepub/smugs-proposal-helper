import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
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
import { useGetCallerUserProfile, useSubmitMotionProposal } from '../../hooks/useQueries';
import { Loader2, Send, AlertCircle, CheckCircle2, FileText, AlertTriangle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function ProposalForm() {
  const { data: userProfile } = useGetCallerUserProfile();
  const submitMotionProposal = useSubmitMotionProposal();

  const [proposalText, setProposalText] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submittedProposalId, setSubmittedProposalId] = useState('');

  const handleOpenConfirmDialog = () => {
    setValidationError('');
    setSuccessMessage('');
    setSubmittedProposalId('');

    if (!userProfile?.selectedNeuronId) {
      setValidationError('Please configure a neuron ID first in the Neuron tab');
      return;
    }

    if (!proposalText.trim()) {
      setValidationError('Please enter proposal text');
      return;
    }

    if (proposalText.trim().length < 10) {
      setValidationError('Proposal text must be at least 10 characters');
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmDialog(false);
    setValidationError('');
    setSuccessMessage('');
    setSubmittedProposalId('');

    if (!userProfile?.selectedNeuronId) {
      setValidationError('No neuron ID configured');
      return;
    }

    try {
      // Submit the proposal to the NNS via backend
      const proposalId = await submitMotionProposal.mutateAsync({
        neuronId: userProfile.selectedNeuronId,
        proposalText: proposalText.trim(),
      });

      // Success - show the real proposal ID
      setSubmittedProposalId(proposalId);
      setSuccessMessage(
        `Proposal successfully submitted to the NNS! Proposal ID: ${proposalId}`
      );
      setProposalText('');
      
      // Clear success message after 10 seconds
      setTimeout(() => {
        setSuccessMessage('');
        setSubmittedProposalId('');
      }, 10000);
    } catch (error: any) {
      // Handle errors
      const errorMessage = error.message || 'Failed to submit proposal';
      setValidationError(errorMessage);
    }
  };

  const characterCount = proposalText.length;
  const isValid = characterCount >= 10;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Alert className="border-amber-500/50 bg-amber-500/10">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-600 text-sm">
          <strong>Backend Integration Required:</strong> Real NNS proposal submission is not yet implemented. 
          The backend needs a <code className="text-xs bg-amber-900/20 px-1 py-0.5 rounded">submitMotionProposal</code> method 
          that makes cross-canister calls to the NNS Governance canister.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Motion Proposal</CardTitle>
          <CardDescription>
            Create and submit a motion proposal to the Network Nervous System. Motion proposals are used to gauge community sentiment on various topics.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!userProfile?.selectedNeuronId && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please configure a neuron ID in the Neuron tab before submitting proposals.
              </AlertDescription>
            </Alert>
          )}

          {userProfile?.selectedNeuronId && (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Submitting from neuron: <span className="font-mono">{userProfile.selectedNeuronId}</span>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="proposalText">Proposal Text</Label>
              <span className={`text-xs ${isValid ? 'text-muted-foreground' : 'text-destructive'}`}>
                {characterCount} characters {!isValid && '(minimum 10)'}
              </span>
            </div>
            <Textarea
              id="proposalText"
              placeholder="Enter your motion proposal text here. Be clear and concise about what you're proposing..."
              value={proposalText}
              onChange={(e) => {
                setProposalText(e.target.value);
                setValidationError('');
              }}
              className="min-h-[200px] resize-y"
            />
          </div>

          <Button
            onClick={handleOpenConfirmDialog}
            disabled={submitMotionProposal.isPending || !isValid}
            className="w-full gap-2"
            size="lg"
          >
            {submitMotionProposal.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting to NNS...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Proposal
              </>
            )}
          </Button>

          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{validationError}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                <div className="space-y-1">
                  <p className="font-medium">{successMessage}</p>
                  {submittedProposalId && (
                    <p className="text-xs">
                      View your proposal at{' '}
                      <a
                        href={`https://nns.ic0.app/proposal/?u=qoctq-giaaa-aaaaa-aaaea-cai&proposal=${submittedProposalId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-green-700"
                      >
                        nns.ic0.app
                      </a>
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Separator />

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs space-y-2">
              <p>
                <strong>Important:</strong> Submitting a proposal costs 1 ICP, which will be refunded if the proposal is adopted. If rejected, the ICP is burned.
              </p>
              <p>
                Your neuron must have at least 10 ICP staked and a dissolve delay of 6 months or more to submit proposals.
              </p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Proposal Submission</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>You are about to submit the following motion proposal to the NNS:</p>
              <div className="bg-muted p-4 rounded-md max-h-[300px] overflow-y-auto">
                <p className="text-sm text-foreground whitespace-pre-wrap">{proposalText}</p>
              </div>
              <div className="space-y-1 text-xs">
                <p>
                  Neuron ID: <span className="font-mono">{userProfile?.selectedNeuronId}</span>
                </p>
                <p className="text-muted-foreground">
                  This will cost 1 ICP (refunded if adopted, burned if rejected)
                </p>
              </div>
              <Alert className="border-amber-500/50 bg-amber-500/10">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-xs text-amber-600">
                  This action cannot be undone. Make sure your proposal text is correct before submitting.
                </AlertDescription>
              </Alert>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit}>Submit to NNS</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
