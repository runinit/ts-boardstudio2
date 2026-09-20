# Wave1 F react_docs
Observed 2026-09-20, current staged tree348e0e5.

React18.3.1 local dependency. Candidate refs+transient transform ownership, memo isolation, transitions do not accelerate geometry. Suspect RFC SHA returned404 per independent skeptic, rejected. Same-project docs/WG are not independent corroboration. Need actual current createRoot/ownership proof.

Sources: https://react.dev/reference/react/useRef; https://react.dev/reference/react/memo; https://react.dev/reference/react/useSyncExternalStore; https://github.com/reactwg/react-18/discussions/21

## EXPAND
- LEAD: Verify root uses createRoot and currentSVG imperative ownership. WHY: batching semantics and ownership contract. ANGLE: entrypoint and renderer axisB. Counter-citation correction expansion also opened.
