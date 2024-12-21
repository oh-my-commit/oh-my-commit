import { homedir } from "node:os"
import path from "node:path"
import { APP_ID_DASH } from "../common/app"

export const omcUserDir = path.join(path.resolve(homedir()), `.${APP_ID_DASH}`)
export const omcConfigPath = path.join(omcUserDir, "config.json")
export const omcProvidersDir = path.join(omcUserDir, "providers")
