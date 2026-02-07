// Utility to get the application's canister ID from build-time environment
export function getCanisterId(): string {
  // Try common environment variable patterns for the backend canister
  const canisterId = 
    import.meta.env.VITE_CANISTER_ID_BACKEND ||
    import.meta.env.CANISTER_ID_BACKEND ||
    import.meta.env.VITE_BACKEND_CANISTER_ID ||
    'rrkah-fqaaa-aaaaa-aaaaq-cai'; // Fallback for local development
  
  return canisterId;
}
