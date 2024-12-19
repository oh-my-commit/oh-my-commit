import { defineConfig } from "tsup";
import path from "path";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "common/index": "src/common/index.ts",
    "server/index": "src/server/index.ts",
    "server/providers/oh-my-commit": "src/server/providers/oh-my-commit.ts",
    "server/get-templates-dir": "src/server/get-templates-dir.ts",
  },
  format: ["cjs", "esm"],
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  outExtension({ format }) {
    return {
      js: format === "cjs" ? ".js" : ".mjs",
    };
  },
  esbuildOptions(options) {
    options.alias = {
      "@": path.resolve(__dirname, "./src"),
    };
  },
});
