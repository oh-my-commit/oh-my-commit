import { mockFileChanges } from "@/data/mock-file-changes";

export const defaultAppState = {
  title: "",
  body: `
const textarea = textareaRef.current;
if (!textarea) return;

// 先将高度设为 0，这样可以正确计算 scrollHeight
textarea.style.height = '0';

// 然后设置为实际需要的高度
const height = Math.max(150, textarea.scrollHeight);
textarea.style.height = \`\${height}px\`;
  `,
  isAmendMode: false,
  diff: "",
  filesChanged: mockFileChanges,
  selectedFiles: new Set(mockFileChanges.map((f) => f.path)), // 默认全选
};
