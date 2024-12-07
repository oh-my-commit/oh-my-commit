import { useCommit } from "../hooks/useCommit";

export function CommitExample() {
  const commit = useCommit();

  // 1. 读取示例
  const readExample = () => {
    // 直接访问状态
    console.log("提交消息:", commit.message);
    console.log("文件统计:", commit.stats);
  };

  // 2. 基础更新示例
  const basicUpdateExample = () => {
    // 更新字段
    commit.setMessage("feat: 新功能");
    commit.setDetail("详细说明新功能的实现");

    // 文件操作
    commit.addFile({ path: "src/new-file.ts", status: "added" });
    commit.removeFile("src/old-file.ts");
  };

  // 3. 自动生成示例
  const autoGenerateExample = () => {
    // 一键生成提交消息和详情
    commit.generate();
  };

  return (
    <div>
      <h2>Commit 状态操作示例 (简化版)</h2>

      <div>
        <button onClick={readExample}>读取状态</button>
        <button onClick={basicUpdateExample}>基础更新</button>
        <button onClick={autoGenerateExample}>自动生成</button>
        <button onClick={commit.reset}>重置状态</button>
      </div>

      <div>
        <h3>文件统计</h3>
        <pre>{JSON.stringify(commit.stats, null, 2)}</pre>
      </div>

      <div>
        <h3>当前状态</h3>
        <pre>
          {JSON.stringify(
            {
              message: commit.message,
              detail: commit.detail,
              files: commit.files,
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
}
