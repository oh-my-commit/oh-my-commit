<div align="center">

# Oh My Commit

A VSCode extension redefining Git commits with a focus on user experience, making every commit elegant and professional.

[English](./README.md) | [简体中文](./README.zh-CN.md)

<!-- toc -->

[Highlights](#highlights) • [AI Capabilities](#ai-capabilities) • [Usage](#usage) • [Configuration](#configuration) • [Contributing](#contributing) • [Support](#support) • [License](#license)

<!-- tocstop -->

</div>

## Highlights

- **Ultimate User Experience**

  - Modern interface design with light/dark theme support
  - Smooth animations with zero-delay response
  - Smart context awareness adapting to your workflow
  - Keyboard-first operation design for efficiency
  - Diverse file change views for enhanced browsing:
    - Tree view: Clear file hierarchy structure
    - Tile view: Quick overview of all changed files
    - Auto staging: Smart handling of all file changes
  - Multiple interface modes for different scenarios:
    - Silent mode: Commit info in status bar only
    - Notification mode: Pop-up notifications with quick edits
    - Window mode: Floating window, clean and efficient
    - Panel mode: Full functionality, professional experience

- **Efficient Workflow**
  - One-click smart commits, goodbye to tedious operations
  - Real-time preview and editing, WYSIWYG
  - Quick switching between commit schemes
  - Team configuration sharing, unified commit style

## AI Capabilities

- **Multi-model Support**

  - Built-in Oh My Commit professional model optimized for code commits
  - Support for OpenAI GPT-3.5/4, Claude, and other mainstream models
  - Customizable AI service endpoints for flexible expansion

- **Provider Installation**

  - Install official provider via npm:
    ```bash
    # Install globally
    npm install -g @oh-my-commit/provider-official
    
    # Or install locally in your project
    npm install @oh-my-commit/provider-official
    ```
  - Provider files will be automatically installed to `~/.oh-my-commit/providers/official/`
  - Custom providers can be installed to the same directory structure

- **Intelligent Analysis**

  - Deep understanding of code change context
  - Automatic identification of refactoring, bugfix, feature types
  - Generate commit messages matching team style

- **Continuous Optimization**
  - Continuous improvement based on user feedback
  - Regular model capability updates
  - Support for custom training fine-tuning

## Usage

1. Install "Oh My Commit" from VSCode Extension Marketplace
2. After making code changes, press `cmd+shift+p` to open the command palette, search for "Oh My Commit: Quick Commit"
3. The plugin will automatically analyze your changes and generate appropriate commit messages, which you can confirm with Enter or modify

## Configuration

| Configuration                          | Type    | Default             | Description                                    | Options                                                                                                                                               |
| -------------------------------------- | ------- | ------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `oh-my-commit.basic.enabled`           | boolean | true                | Enable Oh My Commit                            | `true / false`                                                                                                                                        |
| `oh-my-commit.basic.uiLanguage`        | string  | "system"            | Interface display language                     | • `system`: Follow system language<br>• `zh_CN`: Chinese<br>• `en_US`: English                                                                        |
| `oh-my-commit.ac.model`                | string  | "oh-my-commit.test" | Select AC service provider and model           | • `oh-my-commit.test`<br>• `oh-my-commit.balanced`<br>• `oh-my-commit.professional`<br>• `cgop.openai.chatgpt-3.5`<br>• `cgop.openai.chatgpt-4`       |
| `oh-my-commit.git.emptyChangeBehavior` | string  | "skip"              | Behavior when no file changes                  | • `skip`: Skip empty changes<br>• `amend`: Modify last commit (git commit --amend)                                                                    |
| `oh-my-commit.git.autoStage`           | boolean | true                | Auto stage all changes                         | `true / false`                                                                                                                                        |
| `oh-my-commit.git.commitLanguage`      | string  | "system"            | Git commit message language                    | • `system`: Follow system language<br>• `zh_CN`: Chinese commit messages<br>• `en_US`: English commit messages                                        |
| `oh-my-commit.ai.apiKeys`              | object  | -                   | AI service provider API key configuration      |                                                                                                                                                       |
| `oh-my-commit.ui.mode`                 | string  | "webview"           | Commit interface mode                          | • `quickInput`: Quick & Simple: Single-line input box for fast commits<br>• `webview`: Professional: Full-featured editor with preview and formatting |
| `ohMyCommit.proxy.enabled`             | boolean | false               | Enable proxy for API requests                  | `true / false`                                                                                                                                        |
| `ohMyCommit.proxy.url`                 | string  | "http://localhost:7890" | Proxy server URL                          | Any valid proxy URL (e.g. "http://localhost:7890")                                                                                                    |
| `oh-my-commit.telemetry.enabled`       | boolean | true                | Enable usage data collection (anonymous)       | `true / false`                                                                                                                                        |
| `oh-my-commit.telemetry.shareLevel`    | string  | "basic"             | Data collection level                          | • `minimal`: Basic error info only<br>• `basic`: Feature usage stats and performance data<br>• `full`: Additional AI generation quality feedback      |
| `oh-my-commit.feedback.enabled`        | boolean | true                | Enable user feedback (one-click GitHub Issues) | `true / false`                                                                                                                                        |

## Contributing

Contributions are welcome! Please check our [Contributing Guide](CONTRIBUTING.md) for details.

## Support

If you encounter any issues or have suggestions:

1. Check the [FAQ](docs/guide/faq.md)
2. Submit an [Issue](https://github.com/oh-my-commit/oh-my-commit/issues)

## License

Oh My Commit is licensed under [MIT + Commons Clause](./LICENSE). This means:

- ✅ You can freely use, modify, and distribute this software
- ✅ You can use this software in personal or internal projects
- ✅ You can create and distribute modified versions
- ❌ You cannot sell this software as a paid service or product
- ❌ You cannot commercialize this software without authorization

If you want to use Oh My Commit in a commercial environment, please contact us for a commercial license.

For detailed terms, please check the [LICENSE](./LICENSE) file.
