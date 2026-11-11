import '@testing-library/jest-dom';

// Polyfill BroadcastChannel if not available in jsdom
if (typeof globalThis.BroadcastChannel === 'undefined') {
  class MockBroadcastChannel {
    name: string;
    onmessage: ((event: any) => void) | null = null;
    constructor(name: string) {
      this.name = name;
    }
    postMessage(_data: any) {}
    close() {}
  }
  (globalThis as any).BroadcastChannel = MockBroadcastChannel;
}
