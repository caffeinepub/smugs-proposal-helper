# Specification

## Summary
**Goal:** Enable authenticated users to submit real NNS motion proposals (not simulated) and see real proposal IDs and outcomes in the UI and activity history.

**Planned changes:**
- Add a new authenticated backend method that submits a motion proposal to the NNS Governance canister via cross-canister call, accepting neuron ID + proposal text and returning the real NNS proposal ID or a descriptive error.
- Update backend proposal history recording to add a pending attempt on submission start, then record a success (with real proposal ID) or failure (with error message), keeping the last 10 attempts per user.
- Update the Proposal UI to call the real-submission backend method, remove simulated submission messaging, and display success/failure messages in English; ensure the Activity History “Proposals” table shows real proposal IDs and statuses.

**User-visible outcome:** Users can submit real NNS motion proposals from the app, receive a real NNS proposal ID on success (or a clear error on failure), and review accurate proposal attempt history including pending/success/failed statuses.
