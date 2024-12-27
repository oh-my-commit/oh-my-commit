# Oh My Commit 常见问题解答 (FAQ)

<!-- toc -->

[基础问题](#基础问题) • [功能相关](#功能相关) • [配置问题](#配置问题) • [性能与成本](#性能与成本) • [故障排除](#故障排除) • [其他问题](#其他问题)

<!-- tocstop -->

## 基础问题

<details>
<summary>Q: Oh My Commit 是什么？</summary>

A: Oh My Commit（Yet Another Auto Commit，读作"雅刻"）是一款 VSCode 插件，它能通过 AI 智能分析代码变更，自动生成高质量的 commit message，帮助开发者提升开发效率和代码库的可维护性。

</details>

<details>
<summary>Q: Oh My Commit 支持哪些语言？</summary>

A: Oh My Commit 支持所有编程语言的代码变更分析，因为它关注的是代码变更的语义而不是特定的编程语言。

</details>

## 功能相关

<details>
<summary>Q: 如何快速开始使用 Oh My Commit？</summary>

A:

1. 在 VSCode 扩展商店安装 Oh My Commit
2. 配置必要的 API 密钥
3. 使用快捷键或命令面板中的 `Oh My Commit: Quick Commit` 命令即可开始使用
</details>

<details>
<summary>Q: 有哪些提交方案可以选择？</summary>

A: Oh My Commit 提供了多种预设的提交方案：

- `official_recommend`：官方推荐方案，平衡性能与成本
- `gcop_fast`：速度优先方案
- `premium_quality`：质量优先方案
你也可以自定义自己的提交方案。
</details>

<details>
<summary>Q: 如何切换不同的提交方案？</summary>

A: 你可以通过以下方式切换：

1. 点击状态栏中的方案名称
2. 使用命令面板中的 `Oh My Commit: Select Model` 命令
3. 在设置界面中进行切换
</details>

## 配置问题

<details>
<summary>Q: 如何配置 API 密钥？</summary>

A:

1. 通过命令面板执行 `Oh My Commit: Configure API Keys`
2. 在配置界面中填入相应的 API 密钥
3. 使用测试按钮验证 API 可用性
</details>

<details>
<summary>Q: 如何自定义提交方案？</summary>

A:

1. 打开设置界面
2. 找到提交方案管理部分
3. 创建新方案或编辑现有方案
4. 调整参数以满足你的需求
</details>

## 性能与成本

<details>
<summary>Q: Oh My Commit 的响应速度如何？</summary>

A: 在快速提交模式下，Oh My Commit 的响应时间通常小于 2 秒。具体速度取决于你选择的提交方案和网络状况。

</details>

<details>
<summary>Q: 如何优化 API 调用成本？</summary>

A:

1. 使用 `gcop_fast` 方案可以降低 API 调用成本
2. 合理配置提交方案的参数
3. 使用团队共享配置避免重复调用
</details>

## 故障排除

<details>
<summary>Q: 提交失败怎么办？</summary>

A:

1. 检查 API 密钥是否正确配置
2. 验证网络连接是否正常
3. 查看 VSCode 输出面板中的错误日志
4. 如果问题持续，请提交 Issue 或加入 Discord 社区寻求帮助
</details>

<details>
<summary>Q: 如何报告问题？</summary>

A: 你可以通过以下方式获取帮助：

1. 在 GitHub 上提交 [Issue](https://github.com/cs-magic-open/oh-my-commit/issues)
2. TODO: 加入我们的 [Discord 社区](https://discord.gg/oh-my-commit)
</details>

## 其他问题

<details>
<summary>Q: Oh My Commit 支持团队协作吗？</summary>

A: 是的，Oh My Commit 支持：

- 团队配置共享
- Git hooks 集成
- 统一的提交规范
- 团队级别的提交历史分析
</details>

<details>
<summary>Q: 如何参与 Oh My Commit 的开发？</summary>

A: 我们欢迎社区贡献！请：

1. 阅读我们的[贡献指南](https://github.com/cs-magic-open/oh-my-commit/blob/main/CONTRIBUTING.md)
2. 提交 Pull Request
</details>
