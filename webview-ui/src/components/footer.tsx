import React from "react";

export const Footer: React.FC = () => {
  return (
    <div className="status-bar">
      <div className="status-left">
        <span className="brand-text">YAAC</span>
      </div>

      <span className="hint">AI-powered commit message</span>
    </div>
  );
};
