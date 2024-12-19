import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts", "src/common/index.ts", "src/server/index.ts"],
  format: ["esm", "cjs"],
  dts: {
    compilerOptions: {
      composite: false,
      incremental: false,
      tsBuildInfoFile: undefined,
    },
  },
  splitting: false,
  sourcemap: true,
  clean: true,
})
