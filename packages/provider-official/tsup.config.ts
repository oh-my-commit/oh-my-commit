import { omcProvidersDir } from "@shared/server"
import * as path from "node:path"
import { defineConfig } from "tsup"
import baseConfig from "../../tsup.config"

export default defineConfig({
  ...baseConfig,
  outDir: path.join(omcProvidersDir, "official"),
})
