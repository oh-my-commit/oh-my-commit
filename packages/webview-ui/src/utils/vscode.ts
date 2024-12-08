// Mock VS Code API for development
import type { VSCodeAPI } from '../state/types';

declare global {
  interface Window {
    acquireVsCodeApi(): VSCodeAPI;
  }
}

let vscode: VSCodeAPI | undefined;

export function getVSCodeAPI(): VSCodeAPI {
  if (!vscode) {
    try {
      vscode = window.acquireVsCodeApi();
    } catch (error) {
      // 在非VSCode环境中提供mock实现
      console.warn('Running outside VSCode, using mock implementation');
      const mockState: Record<string, any> = {};
      vscode = {
        getState: () => ({ ...mockState }),
        setState: (state) => Object.assign(mockState, state),
        postMessage: (message) => console.log('VSCode message:', message),
      };
    }
  }
  return vscode;
}
