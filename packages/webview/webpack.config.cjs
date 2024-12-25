const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const path = require("path");
const webpack = require("webpack");
const distDir = path.resolve(__dirname, "dist")

/** @type {import('webpack').Configuration} */
const config = (env, argv) => {
  const isProduction = argv.mode === "production";
  const isDevelopment = !isProduction;

  console.log("-- init webpack config -- ", {isDevelopment});

  return {
    target: "web",
    mode: argv.mode || "development",
    entry: {
      main: './src/main.tsx'
    },
    output: {
      path: distDir,
      filename: "[name].js",
      clean: isProduction,
    },
    devtool: isDevelopment ? "eval-source-map" : "source-map",
    plugins: [
      new webpack.ProvidePlugin({
        React: "react",
      }),
      isDevelopment && new webpack.HotModuleReplacementPlugin(),
      isDevelopment && new ReactRefreshWebpackPlugin(),
    ].filter(Boolean),
    devServer: {
      static: {
        directory: path.join(__dirname, "dist"),
        publicPath: "/",
      },
      allowedHosts: "all",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods":
          "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers":
          "X-Requested-With, content-type, Authorization",
      },
      host: "0.0.0.0",
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
            loader: 'swc-loader',
            options: {
              jsc: {
                parser: {
                  syntax: "typescript",
                  tsx: true,
                  decorators: true,
                },
                transform: {
                  react: {
                    runtime: 'automatic',
                    development: isDevelopment,
                    refresh: isDevelopment,
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
      minimize: !isDevelopment,
    },
  };
};

module.exports = config;
