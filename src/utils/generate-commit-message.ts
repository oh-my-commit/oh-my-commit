// 生成提交消息
import {GitManager} from "@/managers/git.manager";
import {SolutionManager} from "@/managers/solution.manager";

export async function generateCommitMessage(
    gitManager: GitManager,
    solutionManager: SolutionManager
): Promise<string> {
    try {
        // 获取完整的 git diff
        const diff = await gitManager.getDiff();
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