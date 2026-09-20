# Focused verification

Worker executed 45 app setup/assembly/key-option tests,9 engine KiCad10 tests,1 BHK pad-net baseline and2 imported-footprint mapping tests:57 passes. Root independently reran the45 app and9 KiCad10 checks, saved in tests-app.txt and tests-engine.txt. Additional49-test assembly/source group and14-test viewer/ZIP group passed on research workers; overlapping suites are not added into a misleading unique-test total.

Commands:

`PATH=/home/chris/.nvm/versions/node/v24.14.0/bin:$PATH pnpm --dir app exec vitest run src/utils/setupGeneration.test.ts src/utils/assemblyRegression.test.ts src/utils/keyOptions.test.ts src/utils/designSetup.test.ts`

`PATH=/home/chris/.nvm/versions/node/v24.14.0/bin:$PATH npm_config_what=kicad10 pnpm --dir engine test`

`PATH=/home/chris/.nvm/versions/node/v24.14.0/bin:$PATH npm_config_what=native_bhk pnpm --dir engine test --grep 'preserves placement, footprints and pad nets'`

`PATH=/home/chris/.nvm/versions/node/v24.14.0/bin:$PATH npm_config_what=footprint_tools pnpm --dir engine test --grep 'groups electrical pads|mapped nets'`

No build/regeneration/precommit was run; research made no product edits. Green tests do not refute untested connection failures.
