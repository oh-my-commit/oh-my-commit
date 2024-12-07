const path = require("path");

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";
  const isDevelopment = !isProduction;

  return {
    mode: argv.mode || "development",
    entry: "./src/main.tsx",
    output: {
      path: path.resolve(__dirname, "../dist/webview-ui"),
      filename: "main.js",
      clean: true,
      ...(isProduction
        ? {
            libraryTarget: "module",
            chunkFormat: "module",
          }
        : {}),
    },
    experiments: {
      outputModule: isProduction,
    },
    devtool: isDevelopment ? "inline-source-map" : "source-map",
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx", ".css"],
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: "ts-loader",
              options: {
                transpileOnly: true,
              },
            },
          ],
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            'css-loader',
            'postcss-loader'
          ],
        },
      ],
    },
    watchOptions: {
      ignored: /node_modules/,
      aggregateTimeout: 100,
      poll: 1000,
    },
    optimization: {
      minimize: isProduction,
    },
  };
};
