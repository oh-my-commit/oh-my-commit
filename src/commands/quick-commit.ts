import {GitManager} from "@/managers/git.manager";
import {SolutionManager} from "@/managers/solution.manager";
import {generateCommitMessage} from "@/utils/generate-commit-message";
import vscode from "vscode";

export default function quickCommit(solutionManager: SolutionManager, gitManager: GitManager) {
    async () => {
        console.log("Quick commit command triggered");
        try {
            // 检查是否是 Git 仓库
            if (!(await gitManager.isGitRepository())) {
                console.log("Not a git repository");
                vscode.window.showErrorMessage("This workspace is not a git repository");
                return;
            }

            // 检查是否有更改
            if (!(await gitManager.hasChanges())) {
                console.log("No changes detected");
                vscode.window.showInformationMessage("No changes to commit");
                return;
            }

            // 获取当前方案
            const solution = await solutionManager.getCurrentSolution();
            if (!solution) {
                console.log("No solution selected");
                vscode.window.showErrorMessage("No commit solution selected");
                return;
            }
            console.log(`Using solution: ${solution.name}`);

            // 生成提交消息
            const commitMessage = await generateCommitMessage(gitManager, solutionManager);
            console.log(`Generated commit message: ${commitMessage}`);

            // 确认提交消息
            const confirmed = await vscode.window.showInputBox({
                prompt: "Review and edit commit message if needed",
                value: commitMessage,
                validateInput: (value) => value ? null : "Commit message cannot be empty",
            });

            if (confirmed) {
                console.log("Committing changes...");
                // 自动暂存所有更改
                await gitManager.stageAll();
                // 提交更改
                await gitManager.commit(confirmed);
                console.log("Changes committed successfully");
            } else {
                console.log("Commit cancelled by user");
            }
        } catch (error) {
            console.error("Commit failed:", error);
            vscode.window.showErrorMessage(`Failed to commit: ${error}`);
        }
    }
}