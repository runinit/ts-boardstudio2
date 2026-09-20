export default {
  resolve: { alias: { yaml: '/home/chris/projects/ts-boardstudio2/app/node_modules/yaml' } },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: '/home/chris/projects/ts-boardstudio2/app/src/setupTests.tsx',
    include: ['/home/chris/projects/ts-boardstudio2/.omo/evidence/ulw/01a0bda7-b2c3-70e2-8e71-873bb2925e12/G001-fix-performance-issues-in-the-cad-wo/a1/mutations/mutationProfile.test.ts'],
    maxWorkers: 1,
    minWorkers: 1,
  },
};
