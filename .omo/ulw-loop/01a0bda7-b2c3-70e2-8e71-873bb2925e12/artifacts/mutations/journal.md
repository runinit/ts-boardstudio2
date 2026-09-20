# Mutation profiling
Temporary artifact: app/src/utils/mutationProfile.test.ts, to remove after recording baseline/green.
Hypotheses: repeated YAML parse/clone after scalar edits; per-key assembly synchronization; removal recompiles baseline.
Production edits held pending parent approval/browser baseline.
