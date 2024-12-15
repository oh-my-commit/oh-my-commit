import { atomWithStorage } from "@/lib/storage";
import { atom } from "jotai";

// 核心状态原子
export const commitTitleAtom = atomWithStorage({
  key: "oh-my-commits.commit.title",
  defaultValue: "",
});
export const commitBodyAtom = atomWithStorage({
  key: "oh-my-commits.commit.body",
  defaultValue: "",
});
