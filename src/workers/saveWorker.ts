interface SaveWorkerMessage {
    state: Record<string, unknown>;
    cookieName: string;
}

interface SaveWorkerResponse {
    serialized: string;
    cookieName: string;
}

self.addEventListener("message", (e: MessageEvent<SaveWorkerMessage>) => {
    const { state, cookieName } = e.data;
    const serialized = JSON.stringify(state);
    (self as unknown as Worker).postMessage({ serialized, cookieName } satisfies SaveWorkerResponse);
});
