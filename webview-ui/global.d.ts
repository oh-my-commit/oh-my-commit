declare const acquireVsCodeApi: () => { postMessage: (message: any) => void };

declare namespace JSX {
  interface IntrinsicElements {
    "vscode-text-area": any; // You can replace 'any' with a more specific type if known
    "vscode-button": any; // You can replace 'any' with a more specific type if you have one.
  }
}
