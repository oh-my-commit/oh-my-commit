const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const path = require("path");
const ReactRefreshBabel = require('react-refresh/babel');
const webpack = require("webpack");
const distDir = path.resolve(__dirname, "dist")

/** @type {import('webpack').Configuration} */
const config = (env, argv) => {
  const isProduction = argv.mode === "production";
  const isDevelopment = !isProduction;

  return {
    entry: {
      main: [
        './src/main.tsx'
      ].filter(Boolean),
    },
    output: {
      path: distDir,
      filename: "[name].js",
      clean: isProduction,
    },

    target: "web",
    mode: argv.mode || "development",
    devtool: isDevelopment ? "eval-source-map" : "source-map",
    plugins: [
      isDevelopment && new webpack.HotModuleReplacementPlugin(),
      isDevelopment && new ReactRefreshWebpackPlugin({
        overlay: false,
      }),
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
        "Access-Control-Allow-Methods":
          "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers":
          "X-Requested-With, content-type, Authorization",
      },
      hot: true,
      client: {
        overlay: true,
      },
      compress: true,
      port: 18080,
      watchFiles: ['src/**/*'],
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
              loader: 'babel-loader',
              options: {
                presets: [
                  '@babel/preset-env',
                  '@babel/preset-react',
                  '@babel/preset-typescript'
                ],
                plugins: [
                  isDevelopment && ReactRefreshBabel,
                  ["@babel/plugin-proposal-decorators", { "legacy": true }],
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
  };
};

module.exports = config;
