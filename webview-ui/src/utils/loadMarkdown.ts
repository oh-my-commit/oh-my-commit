import commitFormatMd from "@/docs/commit-format.md";
// 从 GitHub 导入的 markdown 文件示例
import remoteGuideMd from "@github-md:https://raw.githubusercontent.com/your-repo/your-guide.md";

export const loadMarkdown = (name: string): string => {
  const markdownFiles = {
    "commit-format": commitFormatMd,
    "remote-guide": remoteGuideMd,
  };

  return markdownFiles[name] || "";
};
