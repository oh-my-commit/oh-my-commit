import { atomWithStorage } from "@/lib/storage"
import { atom } from "jotai"

// 核心状态原子
export const commitTitleAtom = atomWithStorage({
  key: "oh-my-commit.commit.title",
  defaultValue: "",
})
export const commitBodyAtom = atomWithStorage({
  key: "oh-my-commit.commit.body",
  defaultValue: "",
})

export const isGeneratingAtom = atom(
  // 为了提高用户体验，目前的机制是一旦 webview 初始化成功，
  // exntension 就会向 webview 发送初始 commit message
  // 所以默认为 true
  true,
)
