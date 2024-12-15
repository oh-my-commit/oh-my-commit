import { atomWithStorage } from "@/lib/storage";
import { atom } from "jotai";

// 核心状态原子
export const commitTitleAtom = atomWithStorage({
  key: "omc.commit.title",
  defaultValue: "",
});
export const commitBodyAtom = atomWithStorage({
  key: "omc.commit.body",
  defaultValue: "",
});
