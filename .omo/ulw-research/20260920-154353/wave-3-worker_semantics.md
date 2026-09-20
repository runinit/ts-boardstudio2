# wave-3-worker_semantics

Actual Worker.postMessage delegates to hidden outside MessagePort; MessagePort synchronously StructuredSerializeWithTransfer then queues asynchronous deserialization/delivery. https://html.spec.whatwg.org/multipage/workers.html#dedicated-workers-and-the-worker-interface ; https://html.spec.whatwg.org/multipage/web-messaging.html#message-port-post-message-steps. terminate-a-worker aborts running script; grace is application timer, not platform guarantee. Revision acceptance remains separate from hard termination. EXPAND none.
