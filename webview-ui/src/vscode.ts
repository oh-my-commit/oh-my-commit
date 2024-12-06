// Mock VS Code API for development
const mockVsCodeApi = {
  postMessage: (message: any) => {
    console.log("Development mode - Message posted:", message);
  },
  getState: () => {
    return {};
  },
  setState: (state: any) => {
    console.log("Development mode - State updated:", state);
  },
};

// Get VS Code API singleton
let vsCodeApi: any;

export function getVsCodeApi() {
  if (vsCodeApi) {
    return vsCodeApi;
  }

  try {
    if (typeof acquireVsCodeApi === "function") {
      vsCodeApi = acquireVsCodeApi();
    } else {
      console.log("Development mode - Using mock VSCode API");
      vsCodeApi = mockVsCodeApi;
    }
  } catch (error) {
    console.log("Failed to acquire VS Code API, using mock", error);
    vsCodeApi = mockVsCodeApi;
  }

  return vsCodeApi;
}
