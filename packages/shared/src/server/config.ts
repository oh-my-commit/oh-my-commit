import { homedir } from "node:os"
import path from "node:path"
import { APP_ID_DASH } from "../common/app"

export const USERS_DIR = path.join(path.resolve(homedir()), `.${APP_ID_DASH}`)
export const USER_CONFIG_PATH = path.join(USERS_DIR, "config.json")
export const PROVIDERS_DIR = path.join(USERS_DIR, "providers")
export const TEMPLATES_DIR = path.join(USERS_DIR, "templates")
