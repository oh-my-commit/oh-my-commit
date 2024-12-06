import { atom } from "jotai";
import { getStorageValue, setStorageValue } from "@/utils/vscode-storage";

export function atomWithVSCodeStorage<T>(key: string, initialValue: T) {
  const baseAtom = atom(getStorageValue(key, initialValue));
  
  // 创建一个新的派生 atom，它会在值变化时同步到 VSCode 存储
  const derivedAtom = atom(
    (get) => get(baseAtom),
    (get, set, update: T) => {
      set(baseAtom, update);
      setStorageValue(key, update);
    }
  );

  return derivedAtom;
}
