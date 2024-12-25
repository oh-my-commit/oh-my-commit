# VSCode Webview 热更新最佳实践

在 VSCode 扩展开发中，Webview 是一个常用的功能，它允许我们在 VSCode 中嵌入自定义的 Web 界面。本文总结了如何在 VSCode Webview 中实现热更新（Hot Module Replacement，HMR）的最佳实践。

## 关键配置

### 1. Webpack 配置

```javascript
module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";
  const isDevelopment = !isProduction;

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
  };
};
```

### 2. VSCode Webview CSP 配置

```typescript
const isDev = process.env["NODE_ENV"] === "development";
const devServerHost = "http://localhost:18080";

if (isDev) {
  const nonce = require("crypto").randomBytes(16).toString("base64");
  const csp = [
    `form-action 'none'`,
    `default-src ${this.webviewPanel?.webview.cspSource} ${devServerHost}`,
    `style-src ${this.webviewPanel?.webview.cspSource} ${devServerHost} 'unsafe-inline'`,
    `script-src ${devServerHost} 'unsafe-eval' 'nonce-${nonce}'`,
    `connect-src ${devServerHost} ws://localhost:18080/ws`,
  ].join("; ");

  // 在开发模式下使用 webpack dev server
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="${csp}">
        <title>${this.title}</title>
    </head>
    <body>
        <div id="root"></div>
        <script type="module" nonce="${nonce}" src="${devServerHost}/main.js"></script>
    </body>
    </html>`;
}
```

### 3. package.json 开发脚本

```json
{
  "scripts": {
    "dev": "webpack serve --mode development"
  }
}
```

## 注意事项

1. **CSP 配置**：
   - 必须允许 `unsafe-eval` 以支持 React Refresh
   - WebSocket 连接地址必须明确指定
   - 主机名要保持一致（使用 localhost）

2. **Webpack 配置**：
   - 不要使用 `libraryTarget: "module"` 和 `experiments.outputModule`，它们与当前版本的 HMR 不兼容
   - 使用 `webpack serve` 而不是 `webpack --watch`
   - 确保配置了正确的 `host` 和 `port`

3. **开发流程**：
   - 启动 webpack dev server
   - 在 VSCode 中以开发模式启动扩展
   - 修改代码时应该能看到实时更新

## 常见问题

1. **WebSocket 连接被拒绝**：
   - 检查 CSP 配置中的 `connect-src` 是否正确
   - 确保 webpack dev server 的 host 配置与 CSP 中的一致

2. **热更新不工作**：
   - 确保启用了 `HotModuleReplacementPlugin`
   - 检查是否正确配置了 `ReactRefreshWebpackPlugin`
   - 避免使用模块输出格式（module chunk format）

3. **脚本执行被阻止**：
   - 检查 CSP 中的 `script-src` 配置
   - 确保包含了必要的 `nonce` 和 `unsafe-eval`

## 调试技巧

1. 在浏览器中直接访问 `http://localhost:18080` 来测试开发服务器
2. 使用浏览器开发者工具查看网络请求和 WebSocket 连接
3. 检查 VSCode 开发者工具中的控制台输出

## 参考资料

- [VSCode Webview API](https://code.visualstudio.com/api/extension-guides/webview)
- [Webpack Dev Server](https://webpack.js.org/configuration/dev-server/)
- [React Fast Refresh](https://github.com/pmmmwh/react-refresh-webpack-plugin)
- [VSCode React Webviews Demo](https://github.com/sfc-gh-tkojima/vscode-react-webviews) - 一个优秀的示例项目，展示了如何在 VSCode 扩展中正确配置 React Webview 和热更新

## 致谢

本文的实现方案受到了 [sfc-gh-tkojima/vscode-react-webviews](https://github.com/sfc-gh-tkojima/vscode-react-webviews) 项目的启发。该项目提供了一个完整的示例，展示了如何在 VSCode 扩展中正确集成 React Webview 和热更新功能。强烈建议参考该项目来了解更多实现细节。
