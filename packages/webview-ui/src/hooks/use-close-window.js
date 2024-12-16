import { getVSCodeAPI } from "@/lib/storage";
import { uiModeAtom } from "@/state/atoms/ui";
import { useAtom } from "jotai/index";
import { useEffect } from "react";
export const useCloseWindow = () => {
    const [uiMode] = useAtom(uiModeAtom);
    const vscode = getVSCodeAPI();
    useEffect(() => {
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
//# sourceMappingURL=use-close-window.js.map