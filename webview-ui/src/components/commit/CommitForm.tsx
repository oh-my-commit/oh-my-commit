import React from "react";
import { useAtom } from "jotai";
import {
  commitMessageAtom,
  commitDetailAtom,
  commitFilesAtom,
} from "../../state/atoms/commit-core";

interface CommitFormProps {
  onSubmit?: () => void;
}

export const CommitForm: React.FC<CommitFormProps> = ({ onSubmit }) => {
  const [message, setMessage] = useAtom(commitMessageAtom);
  const [detail, setDetail] = useAtom(commitDetailAtom);
  const [files] = useAtom(commitFilesAtom);

  const isValid = message.trim().length > 0 && files.length > 0;

  return (
    <form className="commit-form">
      <div className="commit-input-section">
        <div className="input-group">
          <input
            type="text"
            className="commit-title"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Summary of changes"
          />
        </div>

        <div className="input-group">
          <textarea
            className="commit-detail"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="Detailed explanation of changes"
            rows={4}
          />
        </div>

        <div className="form-actions">
          <button
            className="commit-button"
            onClick={onSubmit}
            disabled={!isValid}
            type="button"
          >
            Commit Changes
          </button>
        </div>
      </div>
    </form>
  );
};
