import { useAtom, useSetAtom, useAtomValue } from "jotai";
import {
  commitAtom,
  commitFileStatsAtom,
  addFileAtom,
  removeFileAtom,
  autoCommitMessageAtom,
  autoCommitDetailAtom,
  resetCommitAtom,
} from "../atoms/commit";

export function useCommit() {
  const [commit, setCommit] = useAtom(commitAtom);
  const stats = useAtomValue(commitFileStatsAtom);

  // 获取所有写入操作
  const addFile = useSetAtom(addFileAtom);
  const removeFile = useSetAtom(removeFileAtom);
  const generateMessage = useSetAtom(autoCommitMessageAtom);
  const generateDetail = useSetAtom(autoCommitDetailAtom);
  const reset = useSetAtom(resetCommitAtom);

  return {
    // 状态
    ...commit,
    stats,

    // 更新单个字段
    setMessage: (message: string) => setCommit({ message }),
    setDetail: (detail: string) => setCommit({ detail }),
    setFiles: (files: typeof commit.files) => setCommit({ files }),

    // 文件操作
    addFile,
    removeFile,

    // 自动生成
    generate: () => {
      generateMessage();
      generateDetail();
    },

    // 重置
    reset,
  };
}
