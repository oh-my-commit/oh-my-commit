# YAAC 安装指南

## 前置要求

1. **Python 环境**

   - Python 3.8 或更高版本
   - pip 包管理器

2. **Node.js 环境**
   - Node.js 14 或更高版本
   - npm 或 pnpm 包管理器

## 安装步骤

### 1. 安装 YAAC VSCode 扩展

1. 打开 VSCode
2. 转到扩展商店 (快捷键: `Cmd+Shift+X`)
3. 搜索 "YAAC"
4. 点击安装

### 2. 安装 GCOP

GCOP 是 YAAC 使用的 Python 服务，用于生成高质量的提交信息。

```bash
pip install gcop
```

验证安装：

```bash
gcop --version
```

### 3. 配置环境变量

根据你选择的 AI 模型，设置相应的环境变量：

#### OpenAI

```bash
export OPENAI_API_KEY='your-api-key'
export OPENAI_API_BASE='https://api.openai.com/v1'  # 可选
```

#### Deepseek

```bash
export DEEPSEEK_API_KEY='your-api-key'
export DEEPSEEK_API_BASE='https://api.deepseek.com/v1'  # 可选
```

#### Zhipu

```bash
export ZHIPU_API_KEY='your-api-key'
export ZHIPU_API_BASE='https://api.zhipu.ai/v1'  # 可选
```

#### Ollama（本地模型）

```bash
# Ollama 默认运行在 localhost:11434，通常不需要配置
export OLLAMA_API_BASE='http://localhost:11434'  # 可选
```

#### Groq

```bash
export GROQ_API_KEY='your-api-key'
export GROQ_API_BASE='https://api.groq.com/v1'  # 可选
```

#### Anthropic

```bash
export ANTHROPIC_API_KEY='your-api-key'
export ANTHROPIC_API_BASE='https://api.anthropic.com/v1'  # 可选
```

> 提示：建议将这些环境变量添加到你的 shell 配置文件中（如 `~/.zshrc` 或 `~/.bashrc`）

### 4. VSCode 设置

1. 打开 VSCode 设置 (快捷键: `Cmd+,`)
2. 搜索 "YAAC"
3. 配置以下选项：
   - 选择 AI 模型（默认：openai/gpt-4）
   - 是否包含 git 历史（可选）
   - 是否启用数据改进（可选）
   - 自定义提交模板（可选）

## 常见问题

### 1. gcop 命令未找到

确保 Python 的 bin 目录在你的 PATH 环境变量中：

```bash
# 查看 gcop 安装位置
which gcop

# 如果未找到，检查 Python 用户 bin 目录
echo $PATH | grep -o "[^:]*python[^:]*"
```

### 2. API 密钥配置问题

- 确保环境变量正确设置
- 重启 VSCode 以加载新的环境变量
- 使用 `echo $OPENAI_API_KEY` 验证环境变量是否正确设置

### 3. 模型选择建议

- OpenAI GPT-4：最佳质量，但成本较高
- Deepseek Chat：良好的性价比
- Ollama：本地部署，无需 API 密钥，但需要更多计算资源
- Zhipu GLM-4：中文支持优秀
- Groq：高性能，适合频繁使用
- Anthropic Claude：优秀的代码理解能力

## 更新和卸载

### 更新 GCOP

```bash
pip install --upgrade gcop
```

### 卸载

```bash
pip uninstall gcop
```

## 支持

如果遇到问题：

1. 查看 [常见问题](#常见问题)
2. 提交 [Issue](https://github.com/cs-magic/yaac/issues)
3. 加入我们的 [Discord 社区](https://discord.gg/yaac)
