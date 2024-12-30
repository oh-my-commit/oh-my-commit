/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { atomWithStorage } from "@/lib/storage"

export type CommitLanguage = "system" | "zh_CN" | "en_US"

export const commitLanguageAtom = atomWithStorage<CommitLanguage>({
  key: "ohMyCommit.git.lang",
  defaultValue: "system",
  storageType: "vscode", // Store in both VSCode and localStorage
})
