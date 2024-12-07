import React from 'react';
import { useAtom } from 'jotai';
import { commitMessageAtom, commitDetailAtom, commitFilesAtom } from '../../state/atoms/commit-core';

interface CommitActionsProps {
  onCommit?: () => void;
  onCancel?: () => void;
}

export const CommitActions: React.FC<CommitActionsProps> = ({ onCommit, onCancel }) => {
  const [message] = useAtom(commitMessageAtom);
  const [detail] = useAtom(commitDetailAtom);
  const [files] = useAtom(commitFilesAtom);

  const isValid = message.trim().length > 0 && files.length > 0;

  return (
    <div className="commit-actions">
      <button
        className="cancel-button"
        onClick={onCancel}
        type="button"
      >
        Cancel
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
  );
};
