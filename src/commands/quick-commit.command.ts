import { VscodeCommand } from "@/commands/types";
import { VscodeGitService } from "@/services/vscode-git.service";
import { SolutionManager } from "@/managers/solution.manager";
import * as vscode from "vscode";

export class QuickCommitCommand implements VscodeCommand {
  public id = "yaac.quickCommit";

  private gitService: VscodeGitService;
  private solutionManager: SolutionManager;
  private context: vscode.ExtensionContext;
  private outputChannel: vscode.OutputChannel;

  constructor(
    gitService: VscodeGitService,
    solutionManager: SolutionManager,
    context: vscode.ExtensionContext
  ) {
    this.gitService = gitService;
    this.solutionManager = solutionManager;
    this.context = context;
    this.outputChannel = vscode.window.createOutputChannel("YAAC");
  }

  get config() {
    return vscode.workspace.getConfiguration("yaac");
  }

  get inputMode() {
    return this.config.get<string>("inputAppearence", "webview");
  }

  get noDiffBehavior() {
    return this.config.get<string>("noDiffBehavior", "ignore");
  }

  /**
   * 无需 handle error，因为最外层 @command.manager.ts 会处理
   */
  async execute(): Promise<void> {
    let commitMessage = "";

    const diff = await this.gitService.getDiff();

    // 仅在未改变且在修改模式下才执行 amend
    const isAmendMode = !diff && this.noDiffBehavior === "revise";

    if (!diff) {
      if (this.noDiffBehavior === "ignore") {
        throw new Error("No changes to commit");
      }

      // Amend mode - allow editing last commit
      commitMessage = await this.gitService.getLastCommitMessage();
      if (!commitMessage) {
        throw new Error("No previous commit found to amend");
      }
    } else {
      // Get solution for commit message
      const solution = await this.solutionManager.generateCommit(diff);
      if (solution.error) throw new Error(solution.error);

      const commitMessage = solution.message;
      console.log(`Generated commit message: ${commitMessage}`);
    }

    // Handle commit based on input mode
    if (this.inputMode === "quickInput") {
      await this.handleQuickInput(commitMessage, isAmendMode);
    } else {
      await this.handleWebView(commitMessage, isAmendMode);
    }

    // Success notification
    vscode.window.showInformationMessage(
      isAmendMode
        ? "Last commit amended successfully"
        : "Changes committed successfully"
    );
  }

  private async handleQuickInput(
    initialMessage: string,
    isAmendMode: boolean
  ): Promise<void> {
    const result = await vscode.window.showInputBox({
      prompt: isAmendMode
        ? "Edit previous commit message"
        : "Review and edit commit message",
      value: initialMessage.split("\n")[0],
      ignoreFocusOut: true,
      placeHolder: "Enter commit message",
    });

    if (!result?.trim()) throw new Error("Commit cancelled");

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: isAmendMode
          ? "Amending last commit..."
          : "Committing changes...",
        cancellable: false,
      },
      async () => {
        if (isAmendMode) {
          await this.gitService.amendCommit(result);
        } else {
          await this.gitService.stageAll();
          await this.gitService.commit(result);
        }
      }
    );
  }

  private async handleWebView(
    initialMessage: string,
    isAmendMode: boolean
  ): Promise<void> {
    const panel = vscode.window.createWebviewPanel(
      "commitMessage",
      isAmendMode ? "Amend Last Commit" : "Commit Message",
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        enableFindWidget: true,
        localResourceRoots: [
          vscode.Uri.joinPath(this.context.extensionUri, 'src', 'webviews')
        ],
        // 在开发模式下启用开发者工具
        ...(process.env.NODE_ENV === "development"
          ? {
              devTools: true,
            }
          : {}),
      }
    );

    // 获取文件的 URI
    const htmlPath = vscode.Uri.joinPath(
      this.context.extensionUri,
      "src",
      "webviews",
      "commit-message.html"
    );
    
    const cssPath = panel.webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.context.extensionUri,
        "src",
        "webviews",
        "index.css"
      )
    );

    const componentPath = vscode.Uri.joinPath(
      this.context.extensionUri,
      "src",
      "webviews",
      "components",
      "CommitItem.js"
    );

    // 读取文件内容
    const [htmlContent, componentContent] = await Promise.all([
      vscode.workspace.fs.readFile(htmlPath),
      vscode.workspace.fs.readFile(componentPath)
    ]);

    let html = Buffer.from(htmlContent).toString("utf-8");
    const component = Buffer.from(componentContent).toString("utf-8");
    
    // 替换资源路径和注入组件代码
    html = html
      .replace('./index.css', cssPath.toString())
      .replace(
        '<script type="module" src="./components/CommitItem.js"></script>',
        `<script type="module">\n${component}\n</script>`
      );

    panel.webview.html = html;

    // Send initial data to webview
    panel.webview.postMessage({
      command: "setInitialMessage",
      message: initialMessage,
    });

    panel.webview.postMessage({
      command: "setCommits",
      commits: await this.gitService.getRecentCommits(5),
    });

    panel.webview.postMessage({
      command: "setAmendMode",
      isAmendMode,
    });

    return new Promise<void>((resolve, reject) => {
      panel.webview.onDidReceiveMessage(
        async (message) => {
          try {
            switch (message.command) {
              case "commit":
                if (isAmendMode) {
                  await this.gitService.amendCommit(message.message);
                } else {
                  await this.gitService.stageAll();
                  await this.gitService.commit(message.message);
                }
                panel.dispose();
                resolve();
                break;
              case "cancel":
                panel.dispose();
                throw new Error("Commit cancelled");
            }
          } catch (error) {
            panel.dispose();
            reject(error);
          }
        },
        undefined,
        []
      );

      // Clean up on panel close
      panel.onDidDispose(() => {
        reject(new Error("Panel closed"));
      });
    });
  }
}
