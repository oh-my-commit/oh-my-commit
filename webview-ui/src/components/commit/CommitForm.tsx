import React from 'react';
import { useAtom } from 'jotai';
import { commitMessageAtom, commitDetailAtom } from '../../state/atoms/commit-core';

interface CommitFormProps {
  onSubmit?: () => void;
}

export const CommitForm: React.FC<CommitFormProps> = ({ onSubmit }) => {
  const [message, setMessage] = useAtom(commitMessageAtom);
  const [detail, setDetail] = useAtom(commitDetailAtom);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.();
  };

  return (
    <form onSubmit={handleSubmit} className="commit-form">
      <div className="commit-input-section">
        <div className="section-header">
          <div className="section-title">
            Commit Message
            <span className="ai-badge">AI</span>
            <span className="hint">
              AI will help you write a better commit message
            </span>
          </div>
        </div>

        <div className="input-group">
          <div className="input-header">
            <div className="input-label">Title</div>
          </div>
          <input
            type="text"
            className="commit-title"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Summary of changes"
          />
        </div>

        <div className="input-group">
          <div className="input-header">
            <div className="input-label">Description</div>
          </div>
          <textarea
            className="commit-detail"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="Detailed explanation of changes"
            rows={4}
          />
        </div>
      </div>
    </form>
  );
};
