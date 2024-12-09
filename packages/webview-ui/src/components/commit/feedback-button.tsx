import React, { useEffect, useRef, useState } from "react";

export const FeedbackButton = ({
  onFeedback,
  disabled,
}: {
  onFeedback?: (
    type: "type" | "content" | "regenerate" | "other",
    details?: string,
  ) => void;
  disabled?: boolean;
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFeedback = (
    type: "type" | "content" | "regenerate" | "other",
  ) => {
    onFeedback?.(type);
    setShowMenu(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        className={`px-4 py-[6px] text-sm rounded-sm inline-flex items-center gap-1.5 select-none transition-colors ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-[var(--vscode-toolbar-hoverBackground)]"
        } text-[var(--vscode-descriptionForeground)]`}
        onClick={() => !disabled && setShowMenu(!showMenu)}
        disabled={disabled}
      >
        <span>Improve</span>
      </button>

      {showMenu && (
        <div
          className="absolute right-0 top-full mt-1 z-50 min-w-[240px] py-1 rounded-sm shadow-lg"
          style={{
            backgroundColor: "var(--vscode-input-background)",
            border: "1px solid var(--vscode-input-border)",
          }}
        >
          <div className="px-3 py-2 border-b border-[var(--vscode-input-border)]">
            <div className="text-xs font-medium mb-1">Suggest Improvements</div>
            <div className="text-[11px] text-[var(--vscode-descriptionForeground)]">
              Help AI generate better commit messages
            </div>
          </div>
          <button
            className="w-full px-3 py-2 text-left hover:bg-[var(--vscode-toolbar-hoverBackground)] group"
            onClick={() => handleFeedback("type")}
          >
            <div className="flex items-center gap-2 text-[11px] font-medium">
              <span>🏷️</span>
              <span>Incorrect Commit Type</span>
            </div>
            <div className="text-[11px] text-[var(--vscode-descriptionForeground)] pl-6 mt-0.5 group-hover:text-[var(--vscode-foreground)]">
              The selected type doesn't match the changes
            </div>
          </button>
          <button
            className="w-full px-3 py-2 text-left hover:bg-[var(--vscode-toolbar-hoverBackground)] group"
            onClick={() => handleFeedback("content")}
          >
            <div className="flex items-center gap-2 text-[11px] font-medium">
              <span>📝</span>
              <span>Enhance Message</span>
            </div>
            <div className="text-[11px] text-[var(--vscode-descriptionForeground)] pl-6 mt-0.5 group-hover:text-[var(--vscode-foreground)]">
              Message could be clearer or more descriptive
            </div>
          </button>
          <button
            className="w-full px-3 py-2 text-left hover:bg-[var(--vscode-toolbar-hoverBackground)] group"
            onClick={() => handleFeedback("regenerate")}
          >
            <div className="flex items-center gap-2 text-[11px] font-medium">
              <span>🔄</span>
              <span>Regenerate Message</span>
            </div>
            <div className="text-[11px] text-[var(--vscode-descriptionForeground)] pl-6 mt-0.5 group-hover:text-[var(--vscode-foreground)]">
              Start over with a new commit message
            </div>
          </button>
          <div className="border-t border-[var(--vscode-input-border)] my-1"></div>
          <button
            className="w-full px-3 py-2 text-left hover:bg-[var(--vscode-toolbar-hoverBackground)] group"
            onClick={() => handleFeedback("other")}
          >
            <div className="flex items-center gap-2 text-[11px] font-medium">
              <span>💡</span>
              <span>Provide Other Feedback</span>
            </div>
            <div className="text-[11px] text-[var(--vscode-descriptionForeground)] pl-6 mt-0.5 group-hover:text-[var(--vscode-foreground)]">
              Share additional suggestions or concerns
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
