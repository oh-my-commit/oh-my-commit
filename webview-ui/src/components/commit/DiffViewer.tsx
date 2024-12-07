import React, { useMemo } from "react";
import { useAtom } from "jotai";
import { selectedFileAtom } from "../../state/atoms/commit-ui";
import { commitFilesAtom } from "../../state/atoms/commit-core";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { selectFileAtom } from "../../state/atoms/commit-ui";

interface DiffLineProps {
  content: string;
  type: "addition" | "deletion" | "context";
  lineNumber: number;
}

const DiffLine: React.FC<DiffLineProps> = ({ content, type, lineNumber }) => (
  <div className={`diff-line ${type}`}>
    <span className="line-number">{lineNumber}</span>
    <span className="line-content">{content}</span>
  </div>
);

export const DiffViewer: React.FC = () => {
  const [selectedPath] = useAtom(selectedFileAtom);
  const [files] = useAtom(commitFilesAtom);
  const [, selectFile] = useAtom(selectFileAtom);

  const selectedFile = files.find((f) => f.path === selectedPath);

  const { language } = useMemo(() => {
    if (!selectedFile?.diff) {
      return { language: "text" };
    }

    // Detect file language from extension
    const ext = selectedFile.path.split(".").pop()?.toLowerCase() || "text";
    const languageMap: Record<string, string> = {
      ts: "typescript",
      tsx: "typescript",
      js: "javascript",
      jsx: "javascript",
      py: "python",
      // Add more mappings as needed
    };

    return {
      language: languageMap[ext] || "text",
    };
  }, [selectedFile]);

  if (!selectedFile) {
    return (
      <div className="diff-viewer empty">
        <p>Select a file to view changes</p>
      </div>
    );
  }

  const handleClose = () => {
    selectFile("");
  };

  return (
    <div className="diff-viewer">
      <div className="diff-header">
        <div className="file-info">
          <span className="file-path" title={selectedFile.path}>
            {selectedFile.path}
          </span>
          <span className="file-stats">
            <span className="additions" title="Lines added">
              +{selectedFile.additions}
            </span>
            <span className="deletions" title="Lines removed">
              -{selectedFile.deletions}
            </span>
          </span>
        </div>
        <button
          className="close-button"
          onClick={handleClose}
          title="Close diff view"
        >
          Close
        </button>
      </div>
      
      <div className="diff-content">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          showLineNumbers
          wrapLines
          customStyle={{
            margin: 0,
            padding: "1rem",
            background: "transparent",
          }}
        >
          {selectedFile.diff || "No changes"}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};
