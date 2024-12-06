import React, { useCallback, useEffect, useRef, useState } from "react";
import { marked } from "marked";
import classnames from "classnames";
import "./detailed-description.css";

interface Props {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

type ViewMode = "plain" | "split" | "preview";

export const DetailedDescription: React.FC<Props> = ({
  value,
  placeholder,
  onChange,
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const plainTextareaRef = useRef<HTMLTextAreaElement>(null);
  const splitTextareaRef = useRef<HTMLTextAreaElement>(null);

  // 同步外部值
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // 自动调整文本区域高度
  const adjustTextareaHeight = useCallback((textarea: HTMLTextAreaElement | null) => {
    if (!textarea) return;
    textarea.style.height = "auto";
    const height = Math.max(150, textarea.scrollHeight);
    textarea.style.height = `${height}px`;
  }, []);

  // 处理文本变化
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      onChange(newValue);
      // 调整当前激活的 textarea 的高度
      if (viewMode === "plain") {
        adjustTextareaHeight(plainTextareaRef.current);
      } else if (viewMode === "split") {
        adjustTextareaHeight(splitTextareaRef.current);
      }
    },
    [onChange, viewMode, adjustTextareaHeight]
  );

  // 监听内容变化时调整所有 textarea 的高度
  useEffect(() => {
    adjustTextareaHeight(plainTextareaRef.current);
    adjustTextareaHeight(splitTextareaRef.current);
  }, [internalValue, adjustTextareaHeight]);

  // 监听视图模式变化，等待过渡动画完成后调整高度
  useEffect(() => {
    const timer = setTimeout(() => {
      if (viewMode === "plain") {
        adjustTextareaHeight(plainTextareaRef.current);
      } else if (viewMode === "split") {
        adjustTextareaHeight(splitTextareaRef.current);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [viewMode, adjustTextareaHeight]);

  return (
    <div className="detailed-description">
      <div className="view-mode-buttons">
        <button
          className={classnames("mode-button", {
            active: viewMode === "plain",
          })}
          onClick={() => setViewMode("plain")}
        >
          Plain
        </button>
        <button
          className={classnames("mode-button", {
            active: viewMode === "split",
          })}
          onClick={() => setViewMode("split")}
        >
          Split
        </button>
        <button
          className={classnames("mode-button", {
            active: viewMode === "preview",
          })}
          onClick={() => setViewMode("preview")}
        >
          Preview
        </button>
      </div>
      <div className={`editor-container mode-${viewMode}`}>
        {/* Plain View */}
        <div className={classnames("view-container plain-view", { active: viewMode === "plain" })}>
          <textarea
            ref={plainTextareaRef}
            value={internalValue}
            onChange={handleChange}
            placeholder={placeholder}
            className="plain-textarea"
          />
        </div>

        {/* Split View */}
        <div className={classnames("view-container split-view", { active: viewMode === "split" })}>
          <textarea
            ref={splitTextareaRef}
            value={internalValue}
            onChange={handleChange}
            placeholder={placeholder}
            className="split-textarea"
          />
          <div
            className="preview-content"
            dangerouslySetInnerHTML={{
              __html: marked(internalValue),
            }}
          />
        </div>

        {/* Preview View */}
        <div className={classnames("view-container preview-view", { active: viewMode === "preview" })}>
          <div
            className="preview-content"
            dangerouslySetInnerHTML={{
              __html: marked(internalValue),
            }}
          />
        </div>
      </div>
    </div>
  );
};
