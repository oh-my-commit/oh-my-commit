import CopyWebpackPlugin from "copy-webpack-plugin"
import path from "path"
import { fileURLToPath } from "url"
import webpack from "webpack"
import baseConfig from "../__base__/webpack.config.mjs"

const { DefinePlugin } = webpack
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const distDir = path.resolve(__dirname, "dist")

/** @type {import('webpack').Configuration} */
const config = (env, argv) => {
  const isProduction = argv.mode === "production"
  const isDevelopment = !isProduction

  return {
    ...baseConfig(env, argv),
    entry: {
      main: "./src/main.tsx",
    },
    output: {
      path: distDir,
      filename: "[name].js",
      clean: isProduction,
    },
    plugins: [
      ...(baseConfig(env, argv).plugins || []),
      new DefinePlugin({
        "process.env": JSON.stringify({
          NODE_ENV: argv.mode,
        }),
        "process.env.NODE_ENV": JSON.stringify(argv.mode),
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "index.html",
            to: distDir,
          },
        ],
      }),
    ],
    devServer: isDevelopment
      ? {
          hot: true,
          devMiddleware: {
            writeToDisk: true,
          },
          watchFiles: {
            paths: ["src/**/*"],
            options: {
              usePolling: true,
            },
          },
        }
      : undefined,
  }
}

export default config
