import { defineConfig } from "tsup"
import baseConfig from "../../tsup.config"

export default defineConfig({
  ...baseConfig,
  // dts: true,
  // onSuccess: "",

  entry: ["src/index.ts", "src/common/index.ts", "src/server/index.ts"],
})
