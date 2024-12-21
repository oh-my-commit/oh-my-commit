import { defineConfig } from "tsup"
import baseConfig from "../__base__/tsup.config"

export default defineConfig({
  ...baseConfig,
  entry: ["./src/index.ts", "src/demo.ts"],
  format: ["cjs"],
  onSuccess: "tsc --experimentalDecorators --emitDecoratorMetadata",
})
