import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

module {
  type NeuronId = Text;
  type Hotkey = Principal;
  type Timestamp = Time.Time;

  type AttemptStatus = {
    #pending;
    #success : Text;
    #failure : Text;
  };

  type HotkeyAttempt = {
    neuronId : NeuronId;
    hotkey : Hotkey;
    timestamp : Timestamp;
    status : AttemptStatus;
  };

  type OldProposalAttempt = {
    neuronId : NeuronId;
    proposalId : Text;
    timestamp : Timestamp;
    status : AttemptStatus;
  };

  type NewProposalAttempt = {
    neuronId : NeuronId;
    proposalId : ?Text;
    timestamp : Timestamp;
    status : AttemptStatus;
  };

  type UserProfile = {
    id : Principal;
    selectedNeuronId : ?NeuronId;
    hotkeyAttempts : [HotkeyAttempt];
    proposalAttempts : [OldProposalAttempt];
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  type UpdatedUserProfile = {
    id : Principal;
    selectedNeuronId : ?NeuronId;
    hotkeyAttempts : [HotkeyAttempt];
    proposalAttempts : [NewProposalAttempt];
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, UpdatedUserProfile>;
  };

  public func run(old : OldActor) : NewActor {
    let updatedUserProfiles = old.userProfiles.map<Principal, UserProfile, UpdatedUserProfile>(
      func(_id, oldProfile) {
        let updatedProposalAttempts = oldProfile.proposalAttempts.map(
          func(oldAttempt) {
            { oldAttempt with proposalId = ?oldAttempt.proposalId };
          }
        );
        { oldProfile with proposalAttempts = updatedProposalAttempts };
      }
    );
    { userProfiles = updatedUserProfiles };
  };
};
