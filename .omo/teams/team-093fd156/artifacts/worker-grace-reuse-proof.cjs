const { StudioQueue, SETTLE_MS, SUPERSEDE_MS } = require(
  '../../../../app/src/utils/studioQueue.ts'
);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const request = (revision) => ({ revision, source: revision });
const factory = (workers) => () => {
  const worker = {
    messages: [],
    terminateCalls: 0,
    onmessage: null,
    onerror: null,
    postMessage(message) {
      this.messages.push(message);
    },
    terminate() {
      this.terminateCalls += 1;
    },
  };
  workers.push(worker);
  return worker;
};

(async () => {
  const reusedWorkers = [];
  const reusedQueue = new StudioQueue(factory(reusedWorkers), () => {});
  reusedQueue.schedule(request('first'));
  await wait(SETTLE_MS + 25);
  reusedQueue.schedule(request('supersede-before-cancel'));
  reusedQueue.dispose();
  reusedQueue.schedule(request('fresh-after-cancel'));
  await wait(SETTLE_MS + 25);
  reusedQueue.schedule(request('supersede-after-reuse'));
  await wait(SUPERSEDE_MS + 50);
  const reusedObservation = {
    workersCreated: reusedWorkers.length,
    freshWorkerTerminateCalls: reusedWorkers[1]?.terminateCalls,
    freshWorkerMessages: reusedWorkers[1]?.messages.map(
      (message) => message.type
    ),
  };

  const controlWorkers = [];
  const controlQueue = new StudioQueue(factory(controlWorkers), () => {});
  controlQueue.schedule(request('first'));
  await wait(SETTLE_MS + 25);
  controlQueue.schedule(request('supersede'));
  await wait(SUPERSEDE_MS + 50);
  const controlObservation = {
    workersCreated: controlWorkers.length,
    firstWorkerTerminateCalls: controlWorkers[0]?.terminateCalls,
    firstWorkerMessages: controlWorkers[0]?.messages.map(
      (message) => message.type
    ),
  };

  console.log(JSON.stringify({ reusedObservation, controlObservation }, null, 2));
  reusedQueue.dispose();
  controlQueue.dispose();
})();
