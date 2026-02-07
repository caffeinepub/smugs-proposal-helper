import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Timestamp = bigint;
export type AttemptStatus = {
    __kind__: "failure";
    failure: string;
} | {
    __kind__: "pending";
    pending: null;
} | {
    __kind__: "success";
    success: string;
};
export type NeuronId = string;
export type Hotkey = Principal;
export interface HotkeyAttempt {
    status: AttemptStatus;
    timestamp: Timestamp;
    neuronId: NeuronId;
    hotkey: Hotkey;
}
export interface ProposalAttempt {
    status: AttemptStatus;
    timestamp: Timestamp;
    neuronId: NeuronId;
    proposalId?: string;
}
export interface UserProfile {
    id: Principal;
    selectedNeuronId?: NeuronId;
    hotkeyAttempts: Array<HotkeyAttempt>;
    proposalAttempts: Array<ProposalAttempt>;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<UserProfile>;
    isCallerAdmin(): Promise<boolean>;
    recordMotionAttempt(neuronId: NeuronId, proposalId: string | null, status: AttemptStatus): Promise<void>;
    saveCallerUserProfile(selectedNeuronId: NeuronId | null): Promise<void>;
}
