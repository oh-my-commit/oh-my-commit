// 生成提交消息
import { SolutionManager } from "@/managers/solution.manager";
import { VscodeGitService } from "@/services/vscode-git.service";

export async function generateCommitMessage(
  gitService: VscodeGitService,
  solutionManager: SolutionManager
): Promise<string> {
  try {
    // 获取完整的 git diff
    const diff = await gitService.getStagedDiff();
    const result = await solutionManager.generateCommit(diff);
    if (result.error) {
      throw new Error(result.error);
    }
    return result.message;
  } catch (error) {
    console.error("Failed to generate commit message:", error);
    throw error;
  }
}
