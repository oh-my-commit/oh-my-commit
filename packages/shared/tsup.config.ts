import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: {
    resolve: true,
    entry: {
      index: "./src/index.ts",
      "types/provider": "./src/types/provider.ts",
      "types/model": "./src/types/model.ts",
      "types/commit": "./src/types/commit.ts",
      "providers/oh-my-commits": "./src/providers/oh-my-commits.ts",
    },
  },
  sourcemap: true,
  clean: true,
  treeshake: true,
  outExtension({ format }) {
    return {
      js: format === "cjs" ? ".js" : ".mjs",
    };
  },
});
