import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "common/index": "src/common/index.ts",
    "server/index": "src/server/index.ts",
  },
  target: "es2020",
  format: ["cjs", "esm"],
  splitting: false,
  sourcemap: true,
  clean: true,
  bundle: true,
  dts: false,
  treeshake: true,
  esbuildOptions(options) {
    options.bundle = true;
    options.platform = "node";
  },
});
