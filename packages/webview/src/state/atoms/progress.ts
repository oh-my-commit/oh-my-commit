/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-27
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { atom } from "jotai"

export interface ProgressState {
  isVisible: boolean
  message?: string
  percentage: number
}

export const progressAtom = atom<ProgressState>({
  isVisible: false,
  percentage: 0,
})
