interface IdleDeadline {
  readonly didTimeout: boolean;
  timeRemaining(): DOMHighResTimeStamp;
}

declare function cancelIdleCallback(handle: number): void;

declare function requestIdleCallback(callback: (deadline: IdleDeadline) => void, options?: { timeout: number }): number;
