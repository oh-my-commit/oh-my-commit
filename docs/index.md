---
layout: home

hero:
  name: "Oh My Commit"
  text: "让 Git 提交优雅而智能"
  tagline: 一款基于 AI 的 Git 提交助手
  image:
    src: /oh-my-commit_256.logo.png
    alt: Oh My Commit
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 在 GitHub 上查看
      link: https://github.com/oh-my-commit/oh-my-commit

features:
  - icon: 🤖
    title: 智能生成
    details: 基于代码变更自动生成规范的提交消息
  - icon: 🎨
    title: 优雅交互
    details: 提供多种交互模式，满足不同场景需求
  - icon: 🔍
    title: 深度分析
    details: 理解代码上下文，生成准确的变更描述
  - icon: 🤝
    title: 团队协作
    details: 统一团队提交风格，提高协作效率
---

<br/>

## 为什么选择 Oh My Commit？

Oh My Commit 是一款基于 AI 的 Git 提交助手，它能帮助你：

- 🤖 **智能生成**：基于代码变更自动生成规范的提交消息
- 🎨 **优雅交互**：提供多种交互模式，满足不同场景需求
- 🔍 **深度分析**：理解代码上下文，生成准确的变更描述
- 🤝 **团队协作**：统一团队提交风格，提高协作效率


## 如何定制您自己的 AI Commit 实现？

请阅读：[AI Commit Provider 实现指南](/guide/provider-docs) ，核心就是基于我们预设的 Context，实现对应的接口，并参考我们 provider 的打包配置到指定目录即可。

## 文档、社区、开源、商业化与 Roadmap

项目采用 MIT + Commons Clause 协议开源，这意味着：
- ✅ 个人和团队可以免费使用
- ✅ 可以自由修改和分发
- ❌ 不能直接商业化

本项目的主要链接：
- Github: https://github.com/oh-my-commit/oh-my-commit
- 文档（囿于精力，大部分文档内容都是 AI 自动生成，如有出入请以代码和 ReadMe 为准）: https://oh-my-commit.github.io 
- VSCode 插件: [Oh My Commit](https://marketplace.visualstudio.com/items?itemName=oh-my-commit.oh-my-commit)
- NPM 包：[npm | oh-my-commit Settings: Packages](https://www.npmjs.com/settings/oh-my-commit/packages)

合作、社群与答疑：
- 遇到问题，推荐优先提 issue: https://github.com/oh-my-commit/oh-my-commit/issues
- 对产品感兴趣，可以联系加入我的 AI 技术（免费）/产品/商业交流群

目前正在开发的功能：
- [x] 基础的 AI 提交信息生成
- [x] CLI & VSCode 双平台支持  
- [x] 插件化架构
- [x] 完整的提交工作流
- [ ] Changeset 集成 (进行中)
- [ ] prompt 管理系统 (计划中)
- [ ] 提交历史分析 (计划中)

一些设想：

如果我们在 commit 这个事情上打穿，把用户散落在各个 IDE、项目里的 commit 都贯穿起来，这个工具可以进化成？

1. **程序员的编程画像**
   - 你最常改动哪些类型的文件
   - 你的代码偏好是什么
   - 你的提交习惯如何

2. **团队的协作仪表盘**
   - 团队的代码修改热力图
   - 成员间的协作网络
   - 项目的演进历史

3. **智能输入法**
```bash
# 自动根据上下文推荐提交信息
$ git commit -m "
> 推荐 1: fix(login): resolve undefined user object issue
> 推荐 2: feat(auth): add token refresh mechanism
> 推荐 3: style(ui): update login form layout
"
```

4. ……

## 特别感谢

- 送我 cursor vip 的继刚兄，他打破了我对所谓“代码洁癖”坚持的幻想，结束了我十年人工编程的生涯，加速将我从一名程序员转变为技术型产品经理
- 提供 idea 与友情支持的春宇、胡博、宋奇、震杰、承平、子弹等一众朋友们
- Anthropic、Windsurf 等杰出的 AI 公司

## 写在最后

作为 2024 年的收官之作，Oh My Commi 虽小，却承载了我对 AI 时代开发工具的诸多思考。

这一个月的开发经历让我深深体会到：**工具的价值不仅在于解决问题，更在于激发可能**。

通过跟 AI 的密切协作，我看到了未来开发方式的一种可能性： **让 AI 处理重复性的工作，让开发者专注于更有创意的部分**。

这不仅仅是一个工具的诞生，更是对未来开发方式的一次探索。如果你也对此感兴趣，欢迎一起来玩：

```bash
echo "LLM YYDS \!"
```

## 花絮

### 1. 本项目的作者有两个

1% 的部分属于我，剩余 99% 属于 AI。

![image.png](https://poketto.oss-cn-hangzhou.aliyuncs.com/20241231173744.png)

### 2. 起个名字真难

起初名字叫 Yet Another AI Commit，后来叫 YAAC（雅刻），最后它的名字叫 Oh My Commit。

### 3. 诞生背景

![image.png](https://poketto.oss-cn-hangzhou.aliyuncs.com/20241231152613.png)

说实话，如果不是有人和我提，我甚至都没能意识到自己其实是也需要一款 AI commit 工具的，可能是因为我长期独立开发，不太需要和别人合作，所以没能意识到规范自己 commit 的重要性。

> 从这个角度出发，人确实还是需要”多在企业里呆着好“，才能实打实地发现企业的痛点，也就是”真需求“，从而解决问题，从而”换取报酬”，至于是否需要打着一个”创业“的名号，除非要”融资“，否则也没那么重要，甚至也无那么必要。

但作为一个有代码洁癖的程序员，我自然也对混乱的代码提交信息深恶痛绝：

```bash
# 真实项目中的提交记录
git log --oneline
a123456 update
b234567 fix bug
c345678 修改了一下
d456789 改了改
```

每次看到这样的提交历史，总会想 - 身为程序员，写出规范、专业的提交信息难道不是基本素养吗？

然而现实是:
- 一天写了十几个提交，每次都要绞尽脑汁想措辞
- 有时想用英文写得专业点，但总觉得不够地道
- 团队有统一的提交规范，但每次都要翻文档查格式
- ……

而且就像垃圾分类推了这么多年还是分不清干湿，程序员也往往分不清 feat/fix/perf/... 啊……

我有时候为了尽可能记录足够完备的历史，commit 的频率非常高，以至于都不知道怎么 commit 才好，最后就 `git add . && git commit -m "."` …… （狗头）

```
* 2c8c412 - . (12 days ago) <markshawn2020>
* db43470 - . (12 days ago) <markshawn2020>
* 01e0a26 - . (12 days ago) <markshawn2020>
* e30cd98 - . (12 days ago) <markshawn2020>
* 10da285 - . (12 days ago) <markshawn2020>
* 83903eb - :sparkles: better tsconfig path aliaas (12 days ago) <markshawn2020>
```

> “懒”真地是人类进步的原动力（不是）。

虽然市面上已经有一些 AI Commit 工具，比如 130 star 的 [mefengl/vscode-i-dont-care-about-commit-message: Yet another AI git commit plugin, but without the need for manual confirmation.](https://github.com/mefengl/vscode-i-dont-care-about-commit-message)（下文代称 `I Dont Care`。

![image.png](https://poketto.oss-cn-hangzhou.aliyuncs.com/20241231154900.png)

我觉得他做的很不错，使用了 vscode 的原生通知，还是挺优雅的，但有几个缺点：
1. **UIUX**：生成的信息不支持修改，以及不支持多行友好显示 body 部分（这个是 vscode 的限制，所以我额外支持了 webview 的交互模型）。
2. **算法**：大部分ai commit 工具基本都是拿到 diff，然后调用一次大模型，基于 function call 生成符合目标格式的 commit message，但总会有一些缺陷，比如在diff 过长超出 token 限制的时候，就不得不转为手动commit。
3. **生态**：目前它只支持 vscode 插件，但我们有时候会用其他 IDE，或者在 terminal 环境里，所以光做 vscode 插件可能是不够的。
4. **产品理念**：参考 [feat(extension): add option to generate commit messages in Chinese](https://github.com/mefengl/vscode-i-dont-care-about-commit-message/pull/58) 作者提到自己开发这款插件是为了“**Don't Care**”，所以尽量不支持配置，与我 "**Do Care**" 的理念是不一致的，这种冲突就无法通过提 PR 去完善了，只能自己再造一个，尽管我确实有在它基础上改过。

![image.png](https://poketto.oss-cn-hangzhou.aliyuncs.com/20241231152932.png)


由于写 UIUX 这个是比较烦的，但是写 prompt 是比较简单的，所以我就想要不我来封装一个框架，定义一套 ai commit 的工作流，然后用户只需关心最核心的 prompt、data 等即可？

于是，一款产品就此诞生了。