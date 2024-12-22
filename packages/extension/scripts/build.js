const esbuild = require("esbuild")
const { resolve } = require("path")

const watch = process.argv.includes("--watch")

const ctx = esbuild
  .context({
    entryPoints: ["src/extension.ts"],
    bundle: true,
    outfile: "../../dist/extension.js",
    platform: "node",
    target: "node16",
    format: "cjs",
    sourcemap: true,
    external: ["vscode"],
    logLevel: "info",
  })
  .catch(() => process.exit(1))

if (watch) {
  ctx.then(context => {
    context.watch()
    console.log("Watching...")
  })
} else {
  ctx.then(context => context.rebuild()).then(() => process.exit(0))
}
