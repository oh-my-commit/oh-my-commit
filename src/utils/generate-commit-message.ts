// 生成提交消息
import { AcManager } from "@/core/ac";
import { VscodeGitService } from "@/core/vscode-git";

export async function generateCommitMessage(
  gitService: VscodeGitService,
  acManager: AcManager
): Promise<string> {
  try {
    // 获取完整的 git diff
    const diff = await gitService.getStagedDiff();
    const result = await acManager.generateCommit(diff);
    if (result.error) {
      throw new Error(result.error);
    }
    return result.message;
  } catch (error) {
    console.error("Failed to generate commit message:", error);
    throw error;
  }
}
