import {
  DiffResultBinaryFile,
  DiffResultNameStatusFile,
  DiffResultTextFile,
} from "simple-git";
import { GitFileChange } from "./git";

export type DiffFile =
  | DiffResultTextFile
  | DiffResultBinaryFile
  | DiffResultNameStatusFile;

export interface TreeNode {
  path: string;
  type: "file" | "directory";
  children?: TreeNode[];
  fileInfo?: GitFileChange;
  expanded?: boolean;
  displayName: string;
}
