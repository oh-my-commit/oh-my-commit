import { mockFileChanges } from "@/data/mock-changed-files";
import { stagedFilesAtom } from "@/state/atoms/commit.changed-files";
import { useSetAtom } from "jotai";
import React, { useEffect } from "react";

export const MockDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const setStagedFiles = useSetAtom(stagedFilesAtom);

  useEffect(() => {
    // 加载mock数据
    setStagedFiles(mockFileChanges);
  }, [setStagedFiles]);

  return <>{children}</>;
};
