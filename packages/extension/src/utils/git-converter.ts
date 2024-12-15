import {
  DiffResult,
  DiffResultTextFile,
  DiffResultBinaryFile,
  DiffResultNameStatusFile,
} from "simple-git";
import {
  GitChangeSummary,
  GitChangeType,
  GitFileChange,
} from "@oh-my-commits/shared";

function getGitChangeType(status: string): GitChangeType {
  switch (status) {
    case "A":
      return GitChangeType.Added;
    case "M":
      return GitChangeType.Modified;
    case "D":
      return GitChangeType.Deleted;
    case "R":
      return GitChangeType.Renamed;
    case "C":
      return GitChangeType.Copied;
    case "U":
      return GitChangeType.Unmerged;
    default:
      return GitChangeType.Unknown;
  }
}

function convertDiffResultFile(
  file: DiffResultTextFile | DiffResultBinaryFile | DiffResultNameStatusFile
): GitFileChange {
  const status = "status" in file ? file.status || "?" : "?";

  return {
    path: file.file,
    status: getGitChangeType(status),
    additions: "insertions" in file ? file.insertions || 0 : 0,
    deletions: "deletions" in file ? file.deletions || 0 : 0,
    diff:
      "diff" in file && typeof file.diff === "string" ? file.diff : undefined,
  };
}

export function convertToGitChangeSummary(diff: DiffResult): GitChangeSummary {
  const files = diff.files.map(convertDiffResultFile);
  const insertions = files.reduce((sum, file) => sum + file.additions, 0);
  const deletions = files.reduce((sum, file) => sum + file.deletions, 0);

  return {
    changed: files.length,
    files,
    insertions,
    deletions,
  };
}
