import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "jotai";
import { CommitPage } from "./pages/CommitPage";
import { MockDataProvider } from "./data/MockDataProvider";
import "./styles/styles.css";

// 确保 DOM 加载完成
window.addEventListener("load", () => {
  const container = document.getElementById("root");
  if (!container) {
    console.error("Root element not found");
    return;
  }

  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <Provider>
        <MockDataProvider>
          <CommitPage />
        </MockDataProvider>
      </Provider>
    </React.StrictMode>
  );
});
