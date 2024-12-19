"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCloseWindow = void 0;
const getVSCodeAPI_1 = require("@/lib/getVSCodeAPI");
const ui_1 = require("@/state/atoms/ui");
const index_1 = require("jotai/index");
const react_1 = require("react");
const useCloseWindow = () => {
    const [uiMode] = (0, index_1.useAtom)(ui_1.uiModeAtom);
    const vscode = (0, getVSCodeAPI_1.getVSCodeAPI)();
    (0, react_1.useEffect)(() => {
        if (uiMode === "window") {
            const handleClose = () => {
                vscode.postMessage({ type: "window-close" });
            };
            window.addEventListener("beforeunload", handleClose);
            return () => window.removeEventListener("beforeunload", handleClose);
        }
        return () => { };
    }, [uiMode]);
};
exports.useCloseWindow = useCloseWindow;
