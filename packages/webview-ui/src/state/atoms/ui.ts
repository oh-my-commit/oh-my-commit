import { VIEW_MODES } from "../../components/commit/file-changes/constants";
import { atomWithStorage } from "../storage";

// View mode atom with persistence
export const viewModeAtom = atomWithStorage<keyof typeof VIEW_MODES>({
  key: "yaac.webview.viewMode",
  defaultValue: "flat",
  storageType: "both",
});
