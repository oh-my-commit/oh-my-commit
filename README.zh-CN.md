<div align="center">



```shell
                               ____  _       __  __          _____                          _ _   
                              / __ \| |     |  \/  |        / ____|                        (_) |  
                             | |  | | |__   | \  / |_   _  | |     ___  _ __ ___  _ __ ___  _| |_ 
                             | |  | | '_ \  | |\/| | | | | | |    / _ \| '_ ` _ \| '_ ` _ \| | __|
                             | |__| | | | | | |  | | |_| | | |___| (_) | | | | | | | | | | | | |_ 
                              \____/|_| |_| |_|  |_|\__, |  \_____\___/|_| |_| |_|_| |_| |_|_|\__|
                                                     __/ |                                        
                                                    |___/                                         
                               
                                                                            
```

<h1 align="center">Oh My Commit</h1>

<p align="center">
  ✨Your Next-gen AI-powered Commit Solution ✨
</p>

<p align="center">
  <img src="https://img.shields.io/npm/v/@oh-my-commit/core?style=flat-square&color=00a8f0" alt="npm version" />
  <img src="https://img.shields.io/npm/dm/@oh-my-commit/core.svg?style=flat-square&color=00a8f0" alt="downloads" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square&color=00a8f0" alt="License" />
</p>



English | [简体中文](./README.zh-CN.md) | [Website Docs](https://oh-my-commit.github.io) | [VScode Extension](https://marketplace.visualstudio.com/items?itemName=ohmycommit.ohmycommit)

</div>

## 产品对比

<div align="center">
✅ 完整支持 &nbsp;&nbsp;|&nbsp;&nbsp; ⚠️ 部分支持 &nbsp;&nbsp;|&nbsp;&nbsp; 🚧 开发中 &nbsp;&nbsp;|&nbsp;&nbsp; ➖ 不支持
</div>

&nbsp;

| 功能特性          | Oh My Commit | VSCode VCS | JetBrains VCS | 其他 AI Commit 插件 | AI Commit CLI |
|---------------|---------|------------|--------------|-------------------|---------------|
| **基础功能**      |
| Git 集成        | ✅ | ✅ | ✅ | ⚠️ | ➖ |
| Diff 预览       | ✅ | ✅ | ✅ | ➖ | ➖ |
| 多文件提交         | ✅ | ✅ | ✅ | ⚠️ | ⚠️ |
| **AI 功能**     |
| 智能提交信息生成      | ✅ | ➖ | ➖ | ✅ | ✅ |
| 多语言支持         | ✅ | ➖ | ➖ | ⚠️ | ⚠️ |
| 自定义算法实现       | ✅ | ➖ | ➖ | ➖ | ➖ |
| **用户体验**      |
| CLI 支持        | ✅ | ➖ | ➖ | ➖ | ✅ |
| GUI 界面        | ✅ | ✅ | ✅ | ⚠️ | ➖ |
| 快捷键支持         | 🚧 | ✅ | ✅ | ⚠️ | ➖ |
| **高级特性**      |
| 团队规范配置        | 🚧 | ➖ | ⚠️ | ➖ | ➖ |
| Changesets 集成 | 🚧 | ➖ | ➖️ | ➖ | ➖ |
| 提交模板          | 🚧 | ⚠️ | ✅ | ➖ | ➖ |
| 提交历史分析        | 🚧 | ✅ | ✅ | ➖ | ➖ |
| **扩展性**       |
| 插件化架构         | ✅ | ✅ | ✅ | ➖ | ➖ |
| 自定义工作流        | 🚧 | ⚠️ | ✅ | ➖ | ➖ |

## UI 对比

![panel comparison](assets/panel-comparison.png)

## 使用方法

> ⚠️ **使用前配置**
> 
> 以官方算法 `@oh-my-commit/provider-official` 为例，您需要：
> 1. 配置 AI 服务密钥：`ANTHROPIC_API_KEY` 或 VSCode 设置 `oh-my-commit.ai.apiKeys.anthropic`
> 2. （可选）配置代理：
>    - CLI：`HTTP_PROXY` 环境变量
>    - VSCode：`ohMyCommit.proxy.url` 与 `ohMyCommit.proxy.enabled`

### Using CLI

```bash
# 全局安装命令行工具
npm install -g oh-my-commit

# 全局安装官方 AI Commit 算法实现
# 第三方目录：`~/.oh-my-commit/providers/`
npm install -g @oh-my-commit/provider-official

# 在 git 仓库中使用
omc  # 查看帮助
omc gen # AI 自动生成 commit
```

### Using VSCode

1. 在 VSCode 扩展商店安装 "[**Oh My Commit**](https://marketplace.visualstudio.com/items?itemName=oh-my-commit.oh-my-commit)"
2. 使用方式：
   - 快捷键：`cmd+shift+p` 搜索 "OMC: Quick Commit"
   - 状态栏：点击状态栏的 Commit 图标
   - 源代码管理：使用 VSCode 内置的 Git 面板

### Using JetBrains

Waiting for release !

## 用户配置

| 配置项                                 | 类型     | 默认值                       | 说明                                              | 可选值                                                                                           |
| -------------------------------------- |--------|---------------------------| ------------------------------------------------- |-----------------------------------------------------------------------------------------------|
| `oh-my-commit.model.id`                | string | "omc-standard-claude-3.5" | 选择自动提交（AC）服务的供应商与模型              | • `omc-standard-claude-3.5`<br>• （可自定义实现，本地安装 / 源码 PR / npm 发布）                               |
| `oh-my-commit.git.lang`      | string | "system"                  | Git 提交信息的语言                                | • `system`: 跟随系统语言<br>• `zh_CN`: 中文提交信息<br>• `en_US`: English commit messages                 |
| `oh-my-commit.ai.apiKeys`              | object | -                         | AI 服务提供商的 API 密钥配置                      |                                                                                               |
| `oh-my-commit.ui.mode`                 | string | "panel"                   | 提交界面模式选择                                  | • `notification`: 通知形式生成 Commit 信息，适合个人快速开发<br>• `panel`: 常驻面板：支持编辑标题内容、查看 Diff 等的专业视图，适合专业协同 |
| `ohMyCommit.proxy.enabled`             | boolean | false                     | 是否启用代理                                      | `true / false`                                                                                |
| `ohMyCommit.proxy.url`                 | string | "http://localhost:7890"   | 代理服务器地址                                | 任意有效的代理URL（如 "http://localhost:7890"）                                                         |

## 贡献指南

欢迎贡献代码！请查看我们的 [贡献指南](CONTRIBUTING.md) 了解详情。

## 支持

如果你遇到任何问题或有建议，请：

1. 查看 [常见问题](docs/guide/faq.md)
2. 提交 [Issue](https://github.com/oh-my-commit/oh-my-commit/issues)

## 许可证

Oh My Commit 使用 [MIT + Commons Clause](./LICENSE) 许可证。这意味着：

- ✅ 你可以自由地使用、修改和分发本软件
- ✅ 你可以在个人或内部项���中使用本软件
- ✅ 你可以创建和分发本软件的修改版本
- ❌ 你不能将本软件作为付费服务或产品销售
- ❌ 你不能在未经授权的情况下商业化使用本软件

如果你想在商业环境中使用 Oh My Commit，请联系我们获取商业授权。

详细条款请查看 [LICENSE](./LICENSE) 文件。
