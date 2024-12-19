import {
  provideVSCodeDesignSystem,
  vsCodeProgressRing,
} from "@vscode/webview-ui-toolkit";
import { Provider } from "jotai";
import React from "react";
import { createRoot } from "react-dom/client";
import { CommitPage } from "./pages/commit.page";

import "./styles/global.css";
import "./styles/markdown.css";
import "@vscode/codicons/dist/codicon.css";

// 注册 VSCode Design System
provideVSCodeDesignSystem().register(vsCodeProgressRing());

const container = document.getElementById("root");
if (!container) {
  console.error("Root element not found");
  throw new Error("Root element not found");
}

const root = createRoot(container);
root.render(
  // <React.StrictMode>
  <Provider>
    {/* <MockDataProvider> */}
    <CommitPage />
    {/* </MockDataProvider> */}
  </Provider>
  // </React.StrictMode>
);
