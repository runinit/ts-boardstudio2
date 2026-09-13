declare global {
  interface Window {
    gtag?: (
      command: 'event',
      eventName: string,
      eventParams?: { [key: string]: any }
    ) => void;
  }
}

export {};
