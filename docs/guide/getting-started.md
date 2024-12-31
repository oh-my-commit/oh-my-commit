# 快速开始

经过一个月的打磨，Oh My Commit 现在支持三种使用方式：

### 1. CLI 命令行

```bash
# 安装 cli
✗ npm install -g @oh-my-commit/cli

changed 118 packages in 10s

27 packages are looking for funding
  run `npm fund` for details


# 安装模型（可自行开发与发布，这样自己就可以装自己的模型了）
✗ npm install -g @oh-my-commit/provider-official

changed 46 packages in 712ms

5 packages are looking for funding
  run `npm fund` for details


# 检查模型是否注册成功
✗ ls -lah ~/.oh-my-commit/providers/official
total 9992
drwxr-xr-x@ 6 mark  staff   192B 12 31 16:24 .
drwxr-xr-x@ 3 mark  staff    96B 12 31 16:24 ..
-rw-r--r--@ 1 mark  staff   5.8K 12 31 16:24 CHANGELOG.md
-rw-r--r--@ 1 mark  staff   2.4M 12 31 16:24 index.js
-rw-r--r--@ 1 mark  staff   2.4M 12 31 16:24 index.mjs
-rw-r--r--@ 1 mark  staff   1.2K 12 31 16:24 package.json


# 查看命令行
✗ omc
   ____  _       __  __          _____                          _ _
  / __ \| |     |  \/  |        / ____|                        (_) |
 | |  | | |__   | \  / |_   _  | |     ___  _ __ ___  _ __ ___  _| |_
 | |  | | '_ \  | |\/| | | | | | |    / _ \| '_ ` _ \| '_ ` _ \| | __|
 | |__| | | | | | |  | | |_| | | |___| (_) | | | | | | | | | | | | |_
  \____/|_| |_| |_|  |_|\__, |  \_____\___/|_| |_| |_|_| |_| |_|_|\__|
                         __/ |
                        |___/
✨ AI-powered commit message generator
📦 Version 0.23.0

Usage: Oh My Commit [options] [command]

Oh My Commit - AI-powered commit message generator

Options:
  -v, -V, --version       output the version number
  -h, -H, --help          display help for command

Commands:
  init                    Initialize Oh My Commit configuration
  list-models             List all available AI Commit models
  select-model <modelId>  Set the default model to use for commit generation
  gen [options]           Generate commit message
  help [command]          display help for command


# 查看当前版本
✗ omc -v
0.23.0


# 查看支持的模型列表（注册的插件都会显示在这里）
✗ omc list-models
2024-12-31T08:23:02.749Z INFO  | [console] Listing models...
2024-12-31T08:23:05.938Z INFO  | [console] Available models:
2024-12-31T08:23:05.938Z INFO  | [console]   ✓ ohMyCommit.standard - omc-standard-claude-3.5 (default)


# 配置代理与自己的 API_KEY，基于当前的 git 环境自动生成 commit
✗ HTTP_PROXY=http://localhost:7890 ANTHROPIC_API_KEY=sk-xxx omc gen
2024-12-31T08:23:08.496Z INFO  | [console] Generating commit message...
2024-12-31T08:23:14.423Z INFO  | [console] Generated commit message:
no-op: no changes
---
There are no changes in the provided diff, so no commit message is needed.
2024-12-31T08:23:14.423Z INFO  | [console]
Use -y flag to commit automatically, or run git commit manually with the message above

```


### 2. VSCode 

您可以直接在 VSCode 插件市场搜索 `oh-my-commit` 进行安装：

> Windsurf 等软件使用 open-vsx 插件市场，我需要一点时间评估一下是否同步发布 open-vsx 版本，亦或直接基于 CICD 为大家分发 vsix 文件。

![image.png](https://poketto.oss-cn-hangzhou.aliyuncs.com/20241231163723.png)

安装完成后，使用 `Cmd + Shift + P` 打开快捷菜单，搜索 `omc` 即可看到我们预设的一些命令，其中 `Quick Commit` 将直接生成提交信息，`Select Model` 用于切换模型，`Focus View` 用于打开 primary sidebar 面板。

![image.png](https://poketto.oss-cn-hangzhou.aliyuncs.com/20241231163337.png)

在插件安装模式下，我们已经预设了一些模型（例如 `ohMyCommit.standard`，它基于 Claude-3.5、支持设置语言、生成 Convention 风格的 Commit ），您可能需要额外配置代理与 API_KEY。

> 项目顺利的话，我将考虑对接硅基流动，额外接入登录系统以减少配置复杂度，但基于开源 DIY 的理念，API_KEY 的独立配置能力将始终为大家保留。

![image.png](https://poketto.oss-cn-hangzhou.aliyuncs.com/20241231164558.png)

由于这款产品的目标是 AI 自动 Commit，因此在产品设计的思考上，我在视图级别上基于信息干扰层次做了一些划分。

#### 2.1 弹窗视图

这种在 commit 生成后会弹出一个独立的窗口，就像网页的 Dialog 一样，之前我已经实现了一版，但后续在学习了 VSCode 的 VCS 面板设计后，我 **放弃** 了这种过于干扰的视图。

#### 2.2 面板视图

面板会静静地栖息在您的侧边栏视图区域，主要用于展示 message 主体、一些快捷操作、最佳实践等，长期来看不会增加过多的东西，尽量保持简洁优雅。
   
个人目前更喜欢拖到 Secondary Sidebar （右侧边栏），这样左边看文件右边看 Commit（Changed File 是可以点击后打开 VSCode 默认支持的 Diff 视图的）。

Changed Files 里支持文件夹操作是一个小亮点，我也不明白为啥其他插件都没做这个，有了这个之后，就很方便文件夹级别的勾选，以生成更精准的提交，为我下一个支持多步 commit 的 MVP 做准备。

> 框选功能已实现，但暂未放开，因为还有一些交互没想明白，技术产品经理有兴趣可以就这个与我交流交流。

![image.png](https://poketto.oss-cn-hangzhou.aliyuncs.com/20241231165634.png)

#### 2.3. 通知视图

通知视图下的功能基本和 `I Dont Care` 差不多，区别在于我们的 `Edit` 按钮点击后会自动打开面板视图，以方便用户修改。（因为 VSCode 默认的快捷输入框是不支持多行的……）
   
![image.png](https://poketto.oss-cn-hangzhou.aliyuncs.com/20241231165222.png)

#### 2.4. 状态栏视图

实际在 generate commit 的时候，状态栏始终会实时显示进度，因此是默认的，如果您不希望在 generate commit 的过程中有任何干扰，可以切换 UiMode 为 `panel`，然后把它折叠即可。

   ![image.png](https://poketto.oss-cn-hangzhou.aliyuncs.com/20241231170625.png)

### 3. Jetbrains

我过去几年首选的 IDE 都是 Jetbrains，因此对它的支持，我一旦有心情、有时间、有必要就会去做。

> 当然也欢迎 pr，基于 monorepo 的代码架构，您可以非常方便地适配您期望的其他平台。

