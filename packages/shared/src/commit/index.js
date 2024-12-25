export async function getAICommitMessage({ summary, changes, type, }) {
    // TODO: 集成现有的 AI commit 生成逻辑
    const context = type === 'changeset'
        ? `Adding changeset for: ${changes}\n${summary}`
        : `Updating versions: ${changes}\n${summary}`;
    // 这里应该调用项目中现有的 AI commit 生成逻辑
    return context;
}
//# sourceMappingURL=index.js.map