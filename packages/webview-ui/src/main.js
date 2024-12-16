import { jsx as _jsx } from "react/jsx-runtime";
import { Provider } from "jotai";
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { CommitPage } from "./pages/commit.page";
import "./styles/global.css";
import "@vscode/codicons/dist/codicon.css";
import { provideVSCodeDesignSystem, vsCodeProgressRing, } from "@vscode/webview-ui-toolkit";
// 注册 VSCode Design System
provideVSCodeDesignSystem().register(vsCodeProgressRing());
const App = () => {
    const [showApp, setShowApp] = useState(false);
    if (!showApp) {
        // return <InitAnimation onEnter={() => setShowApp(true)} />;
    }
    return (_jsx(Provider, { children: _jsx(CommitPage, {}) }));
};
const container = document.getElementById("root");
if (!container) {
    console.error("Root element not found");
    throw new Error("Root element not found");
}
const root = createRoot(container);
root.render(_jsx(React.StrictMode, { children: _jsx(App, {}) }));
//# sourceMappingURL=main.js.map