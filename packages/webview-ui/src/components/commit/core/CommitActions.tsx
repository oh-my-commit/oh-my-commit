import { changedFilesAtom } from "@/state/atoms/commit.changed-files";
import { useAtom } from "jotai";
import React from "react";
import { commitBodyAtom, commitTitleAtom } from "@/state/atoms/commit.message";

interface CommitActionsProps {
  onCommit?: () => void;
  onCancel?: () => void;
  onRegenerate?: () => void;
}

export const CommitActions: React.FC<CommitActionsProps> = ({
  onCommit,
  onCancel,
  onRegenerate,
}) => {
  const [message] = useAtom(commitTitleAtom);
  const [detail] = useAtom(commitBodyAtom);
  const [changedFiles] = useAtom(changedFilesAtom);

  const isValid =
    message.trim().length > 0 && (changedFiles?.files?.length ?? 0) > 0;

  return (
    <div className="actions-bar">
      <div className="actions-left">
        <span className="brand-text">Oh My Commits</span>
        <span className="hint">AI-powered commit message</span>
      </div>
      <div className="actions-right">
        <button className="cancel-button" onClick={onCancel} type="button">
          Cancel
        </button>
        <button
          className="regenerate-button"
          onClick={onRegenerate}
          type="button"
        >
          Regenerate
        </button>
        <button
          className="commit-button"
          onClick={onCommit}
          disabled={!isValid}
          type="button"
        >
          Commit Changes
        </button>
      </div>
    </div>
  );
};
