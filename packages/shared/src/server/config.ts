/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-27
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { homedir } from "node:os"
import path from "node:path"

import { APP_ID_DASH } from "../common/app"

export const USERS_DIR = path.join(path.resolve(homedir()), `.${APP_ID_DASH}`)
export const USER_CONFIG_PATH = path.join(USERS_DIR, "config.json")
export const PROVIDERS_DIR = path.join(USERS_DIR, "providers")
export const TEMPLATES_DIR = path.join(USERS_DIR, "templates")
