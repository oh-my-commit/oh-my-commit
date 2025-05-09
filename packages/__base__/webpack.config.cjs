/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-27
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin")
const path = require("path")
const ReactRefreshBabel = require("react-refresh/babel")
const webpack = require("webpack")

console.log("-- init webpack config --")

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production"
  const isDevelopment = !isProduction

  return {
    target: "web",
    mode: argv.mode || "development",
    devtool: isDevelopment ? "eval-source-map" : "source-map",
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      // new webpack.ProvidePlugin({
      //   React: "react",
      // }),
      isDevelopment && new ReactRefreshWebpackPlugin(),
    ].filter(Boolean),
    devServer: {
      static: {
        directory: path.join(__dirname, "static"),
        publicPath: "/static",
      },
      allowedHosts: "all",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
      },
      hot: true,
      client: {
        overlay: true,
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
          use: [
            {
              loader: "babel-loader",
              options: {
                presets: ["@babel/preset-env", "@babel/preset-react", "@babel/preset-typescript"],
                plugins: [
                  isDevelopment && ReactRefreshBabel,
                  ["@babel/plugin-proposal-decorators", { legacy: true }],
                ].filter(Boolean),
              },
            },
          ],
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
      minimize: isProduction,
    },
    entry: "./src/index.tsx",
  }
}
