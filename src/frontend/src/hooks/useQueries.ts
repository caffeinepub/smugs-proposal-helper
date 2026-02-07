import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, NeuronId, AttemptStatus } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getCallerUserProfile();
      } catch (error: any) {
        if (error.message?.includes('User profile not found')) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveNeuronId() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (neuronId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(neuronId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useSubmitMotionProposal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      neuronId,
      proposalText,
    }: {
      neuronId: NeuronId;
      proposalText: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      
      // The backend doesn't have submitMotionProposal yet
      // For now, we'll throw an error explaining this
      throw new Error(
        'Real NNS proposal submission is not yet implemented. The backend needs a submitMotionProposal method that makes cross-canister calls to the NNS Governance canister (rrkah-fqaaa-aaaaa-aaaaq-cai).'
      );
    },
    onSuccess: () => {
      // Invalidate profile to refresh history
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
    onError: (error: any) => {
      // Handle authorization errors gracefully
      if (error.message?.includes('Unauthorized')) {
        throw new Error('You do not have permission to submit proposals with this neuron.');
      }
      throw error;
    },
  });
}

export function useRecordMotionAttempt() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      neuronId,
      proposalId,
      status,
    }: {
      neuronId: NeuronId;
      proposalId: string | null;
      status: AttemptStatus;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.recordMotionAttempt(neuronId, proposalId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}
