import React from "react";
import { cn } from "../../lib/utils";

interface HighlightTextProps {
  text: string;
  highlight: string;
  className?: string;
}

export const HighlightText: React.FC<HighlightTextProps> = ({
  text,
  highlight,
  className,
}) => {
  if (!highlight?.trim()) {
    return <span className={className}>{text}</span>;
  }

  try {
    const parts = text.split(new RegExp(`(${highlight})`, "gi"));

    return (
      <span className={className}>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight?.toLowerCase() ? (
            <span key={i} className="relative">
              <span className="relative z-10">{part}</span>
              <span
                className="absolute inset-0 bg-vscode-list-activeSelectionBackground"
                style={{ margin: "-1px -1px" }}
              />
            </span>
          ) : (
            part
          )
        )}
      </span>
    );
  } catch (error) {
    // 如果发生错误（比如无效的正则表达式），直接返回原文本
    return <span className={className}>{text}</span>;
  }
};
