import React, { useEffect } from "react";
import { useAtom } from "jotai";
import { commitFilesAtom } from "../state/atoms/commit-core";
import { mockFileChanges } from "./mock-changes";

export const MockDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [, setFiles] = useAtom(commitFilesAtom);

  useEffect(() => {
    // 加载mock数据
    setFiles(mockFileChanges);
  }, [setFiles]);

  return <>{children}</>;
};
