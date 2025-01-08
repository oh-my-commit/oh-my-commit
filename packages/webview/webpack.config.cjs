/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-31
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin")
const path = require("path")
const webpack = require("webpack")
const CopyPlugin = require("copy-webpack-plugin")
const fs = require("fs")

// Local dist directory
const localDistDir = path.resolve(__dirname, "dist")
// Final target directory
const targetDistDir = path.resolve(__dirname, "../extension/dist/webview")

// Ensure local dist directory exists
if (!fs.existsSync(localDistDir)) {
  fs.mkdirSync(localDistDir, { recursive: true })
}

/** @type {import('webpack').Configuration} */
const config = (env, argv) => {
  const isDev = argv.mode === "development"
  const isProd = !isDev

  console.log("-- init webpack config -- ", { isDev })

  return {
    target: "web",
    mode: argv.mode || "development",
    entry: {
      main: "./src/main.tsx",
    },
    output: {
      path: localDistDir,
      filename: "[name].js",
      clean: isProd,
    },
    devtool: isDev ? "eval-source-map" : false,
    plugins: [
      new webpack.ProvidePlugin({
        React: "react",
      }),
      isDev && new webpack.HotModuleReplacementPlugin(),
      isDev && new ReactRefreshWebpackPlugin(),
      // Copy from local dist to target dist
      isProd &&
        new CopyPlugin({
          patterns: [
            {
              from: "**/*",
              to: targetDistDir,
              context: localDistDir,
              noErrorOnMissing: true,
            },
          ],
        }),
    ].filter(Boolean),
    devServer: {
      static: {
        directory: path.join(__dirname, "dist"),
        publicPath: "/",
      },
      allowedHosts: "all",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
      },
      host: "localhost",
      hot: true,
      liveReload: true,
      client: {
        overlay: true,
        progress: true,
      },
      compress: true,
      port: 18080,
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx", ".css"],
      alias: {
        "@": [path.resolve(".", "src")],
        "@shared": [path.resolve(__dirname, "../shared/src")],
      },
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          exclude: /node_modules/,
          use: {
            loader: "swc-loader",
            options: {
              jsc: {
                parser: {
                  syntax: "typescript",
                  tsx: true,
                  decorators: true,
                },
                transform: {
                  react: {
                    runtime: "automatic",
                    development: isDev,
                    refresh: isDev,
                  },
                  decoratorMetadata: true,
                  legacyDecorator: true,
                },
              },
            },
          },
        },
        {
          test: /\.md$/,
          type: "asset/source",
          use: "raw-loader",
        },
        {
          test: /\.css$/,
          use: [
            "style-loader",
            {
              loader: "css-loader",
              options: {
                importLoaders: 1,
              },
            },
            "postcss-loader",
          ],
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: "asset/resource",
        },
      ],
    },
    optimization: {
      minimize: !isDev,
    },
  }
}

module.exports = config
