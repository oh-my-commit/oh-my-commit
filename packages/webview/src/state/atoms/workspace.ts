/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { atom } from "jotai"

import { WorkspaceStatus } from "@shared/common"

export const workspaceStatusAtom = atom<WorkspaceStatus | null>(null)