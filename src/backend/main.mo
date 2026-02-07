import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Core types
  public type NeuronId = Text;
  public type Hotkey = Principal;
  public type Timestamp = Time.Time;

  // History entry types
  public type AttemptStatus = {
    #pending;
    #success : Text;
    #failure : Text;
  };

  public type HotkeyAttempt = {
    neuronId : NeuronId;
    hotkey : Hotkey;
    timestamp : Timestamp;
    status : AttemptStatus;
  };

  public type ProposalAttempt = {
    neuronId : NeuronId;
    proposalId : ?Text;
    timestamp : Timestamp;
    status : AttemptStatus;
  };

  public type UserProfile = {
    id : Principal;
    selectedNeuronId : ?NeuronId;
    hotkeyAttempts : [HotkeyAttempt];
    proposalAttempts : [ProposalAttempt];
  };

  // Persistent storage
  var userProfiles = Map.empty<Principal, UserProfile>();

  // Profile management
  public query ({ caller }) func getCallerUserProfile() : async UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) { profile };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async UserProfile {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view other users' profiles");
    };
    switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) { profile };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(selectedNeuronId : ?NeuronId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    let currentProfile = switch (userProfiles.get(caller)) {
      case (null) {
        {
          id = caller;
          selectedNeuronId;
          hotkeyAttempts = [];
          proposalAttempts = [];
        };
      };
      case (?existing) {
        {
          existing with selectedNeuronId;
        };
      };
    };

    userProfiles.add(caller, currentProfile);
  };

  // Hotkey & Proposal History management (PRIVATE FUNCTIONS)
  func addAttempt<T>(
    attempts : [T],
    newAttempt : T,
    maxAttempts : Nat,
  ) : [T] {
    if (attempts.size() >= maxAttempts) {
      let trimmed = attempts.sliceToArray(0, maxAttempts - 1);
      [trimmed, [newAttempt]].flatten();
    } else {
      [attempts, [newAttempt]].flatten();
    };
  };

  func addHotkeyAttemptInternal(caller : Principal, neuronId : NeuronId, hotkey : Hotkey, status : AttemptStatus) {
    let attempt = {
      neuronId;
      hotkey;
      timestamp = Time.now();
      status;
    };

    let (currentProfile, newHotkeyAttempts) = switch (userProfiles.get(caller)) {
      case (null) {
        (
          {
            id = caller;
            selectedNeuronId = null;
            hotkeyAttempts = [];
            proposalAttempts = [];
          },
          [attempt],
        );
      };
      case (?existing) {
        (existing, addAttempt(existing.hotkeyAttempts, attempt, 10));
      };
    };

    let updatedProfile = {
      currentProfile with hotkeyAttempts = newHotkeyAttempts;
    };
    userProfiles.add(caller, updatedProfile);
  };

  func addProposalAttemptInternal(caller : Principal, neuronId : NeuronId, proposalId : ?Text, status : AttemptStatus) {
    let attempt = {
      neuronId;
      proposalId;
      timestamp = Time.now();
      status;
    };

    let (currentProfile, newProposalAttempts) = switch (userProfiles.get(caller)) {
      case (null) {
        (
          {
            id = caller;
            selectedNeuronId = null;
            hotkeyAttempts = [];
            proposalAttempts = [];
          },
          [attempt],
        );
      };
      case (?existing) {
        (existing, addAttempt(existing.proposalAttempts, attempt, 10));
      };
    };

    let updatedProfile = {
      currentProfile with proposalAttempts = newProposalAttempts;
    };
    userProfiles.add(caller, updatedProfile);
  };

  // NNS Proposal history tracking only
  public shared ({ caller }) func recordMotionAttempt(neuronId : NeuronId, proposalId : ?Text, status : AttemptStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can record proposal attempts");
    };

    addProposalAttemptInternal(caller, neuronId, proposalId, status);
  };
};
