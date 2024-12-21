import { PROVIDERS_DIR } from "@shared/server/config"
import * as path from "node:path"
import { defineConfig } from "tsup"
import baseConfig from "../__base__/tsup.config"

export default defineConfig({
  ...baseConfig,
  entry: ["src/index.ts"],
  format: ["cjs"],
  // splitting: false,
  // sourcemap: false,
  // clean: true,
  noExternal: [/.*/], // 打包所有依赖
  outDir: path.join(PROVIDERS_DIR, "official"),
  // onSuccess: "tsc --experimentalDecorators --emitDecoratorMetadata",
})
