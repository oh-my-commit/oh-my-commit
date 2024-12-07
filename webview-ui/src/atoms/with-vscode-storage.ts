import { atom } from "jotai";
import { getStorageValue, setStorageValue } from "@/utils/vscode-storage";

export function atomWithVSCodeStorage<T>(key: string, initialValue: T) {
  // 尝试从 localStorage 恢复状态
  const savedValue = localStorage.getItem(key);
  const initialStateValue = savedValue ? JSON.parse(savedValue) : initialValue;

  const baseAtom = atom(getStorageValue(key, initialStateValue));

  // 创建一个新的派生 atom，它会在值变化时同步到 VSCode 存储和 localStorage
  const derivedAtom = atom(
    (get) => get(baseAtom),
    (get, set, update: T) => {
      set(baseAtom, update);
      setStorageValue(key, update);
      // 同时保存到 localStorage
      localStorage.setItem(key, JSON.stringify(update));
    }
  );

  return derivedAtom;
}
