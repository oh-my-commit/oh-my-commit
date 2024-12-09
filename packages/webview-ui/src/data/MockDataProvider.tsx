import { mockFileChanges } from "@/data/mock-changed-files";
import { commitFilesAtom } from "@/state/atoms/commit.changed-files";
import { useSetAtom } from "jotai";
import React, { useEffect } from "react";

export const MockDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const setFiles = useSetAtom(commitFilesAtom);

  useEffect(() => {
    // 加载mock数据
    setFiles(mockFileChanges);
  }, [setFiles]);

  return <>{children}</>;
};
