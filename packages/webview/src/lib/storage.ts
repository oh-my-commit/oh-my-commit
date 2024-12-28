/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-28
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { atom } from "jotai"

import { clientPush } from "@/clientPush"

import { getVSCodeAPI } from "./getVSCodeAPI"

// VSCode存储选项
export interface VSCodeStorageOptions<T> {
  key: string
  defaultValue: T
  // default: 'localStorage'
  storageType?: "vscode" | "localStorage" | "both"
  // vscode workspace/global 配置
  storage?: "global" | "workspace"
}

function getFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

function setToLocalStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore
  }
}

function getFromVSCode<T>(key: string, defaultValue: T): T {
  // Request the value from VSCode extension
  clientPush({
    type: "get-settings",
    data: {
      section: key,
    },
  })
  // Return default value initially, will be updated when response comes
  return defaultValue
}

function setToVSCode<T>(key: string, value: T): void {
  // Send update request to VSCode extension
  clientPush({
    type: "update-settings",
    data: {
      section: key,
      value,
    },
  })
}

export function atomWithStorage<T>(options: VSCodeStorageOptions<T>) {
  const { key, defaultValue, storageType = "localStorage" } = options

  // Initialize base atom with appropriate default value
  const initialValue = (() => {
    if (storageType === "localStorage") {
      return getFromLocalStorage(key, defaultValue)
    } else if (storageType === "vscode") {
      return getFromVSCode(key, defaultValue)
    } else {
      // "both"
      // Prefer VSCode state over localStorage
      const vscodeValue = getFromVSCode(key, defaultValue)
      const localValue = getFromLocalStorage(key, defaultValue)
      return vscodeValue ?? localValue
    }
  })()

  const baseAtom = atom<T>(initialValue)

  return atom<T, [T], void>(
    (get) => get(baseAtom),
    (get, set, update) => {
      set(baseAtom, update)

      // Sync to appropriate storage(s)
      if (storageType === "localStorage" || storageType === "both") {
        setToLocalStorage(key, update)
      }
      if (storageType === "vscode" || storageType === "both") {
        setToVSCode(key, update)
      }
    }
  )
}

// Read-only atom for derived state
export function atomWithStorageReadOnly<T>(options: VSCodeStorageOptions<T>) {
  const baseAtom = atomWithStorage(options)
  return atom((get) => get(baseAtom))
}

export function createVSCodeAtom<T>({
  key,
  defaultValue,
}: VSCodeStorageOptions<T>) {
  const baseAtom = atom<T>(defaultValue)

  const derivedAtom = atom(
    (get) => {
      const vscode = getVSCodeAPI()
      const state = (vscode.getState() || {}) as Record<string, unknown>
      return (state[key] as T) ?? get(baseAtom)
    },
    (get, set, update: T) => {
      const vscode = getVSCodeAPI()
      const state = (vscode.getState() || {}) as Record<string, unknown>
      vscode.setState({ ...state, [key]: update })
      set(baseAtom, update)
    }
  )

  return derivedAtom
}
