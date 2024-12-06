import React, { useEffect, useRef, useState } from "react";
import classnames from "classnames";
import { marked } from "marked";
import "./detailed-description.css";

interface DetailedDescriptionProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

type ViewMode = "plain" | "preview" | "split";

export const DetailedDescription: React.FC<DetailedDescriptionProps> = ({
  value,
  onChange,
  placeholder,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>("plain");
  const [internalValue, setInternalValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    onChange(internalValue);
  }, [internalValue, onChange]);

  const calculateHeight = () => {
    const textarea = textareaRef.current;
    const preview = previewRef.current;
    const container = containerRef.current;
    
    if (!textarea || !preview || !container) return;

    // 重置容器高度以便准确计算
    container.style.height = "auto";
    textarea.style.height = "auto";

    // 计算文本输入区域所需的高度
    const textHeight = Math.max(120, textarea.scrollHeight);
    textarea.style.height = `${textHeight}px`;

    // 根据不同模式设置容器高度
    switch (viewMode) {
      case "plain":
        // plain 模式：容器高度自适应输入所需高度
        container.style.height = `${textHeight}px`;
        break;
        
      case "preview":
        // preview 模式：容器高度自适应渲染所需高度
        const previewHeight = Math.max(120, preview.scrollHeight);
        container.style.height = `${previewHeight}px`;
        break;
        
      case "split":
        // split 模式：容器高度适应输入所需高度，右边如果溢出再滚动
        container.style.height = `${textHeight}px`;
        break;
    }
  };

  useEffect(() => {
    // 在内容或视图模式改变时重新计算高度
    calculateHeight();
    
    // 使用 ResizeObserver 监听预览区域的内容变化
    const observer = new ResizeObserver(() => {
      if (viewMode === "preview") {
        calculateHeight();
      }
    });

    if (previewRef.current) {
      observer.observe(previewRef.current);
    }

    return () => observer.disconnect();
  }, [internalValue, viewMode]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInternalValue(e.target.value);
  };

  const handleViewChange = (mode: ViewMode) => {
    if (mode === viewMode) return;
    setViewMode(mode);
  };

  return (
    <div className="detailed-description">
      <div className="view-toggles">
        <button
          className={classnames("view-toggle", {
            active: viewMode === "plain",
          })}
          onClick={() => handleViewChange("plain")}
          title="Plain text"
        >
          Plain
        </button>
        <button
          className={classnames("view-toggle", {
            active: viewMode === "preview",
          })}
          onClick={() => handleViewChange("preview")}
          title="Preview"
        >
          Preview
        </button>
        <button
          className={classnames("view-toggle", {
            active: viewMode === "split",
          })}
          onClick={() => handleViewChange("split")}
          title="Split view"
        >
          Split
        </button>
      </div>

      <div ref={containerRef} className={`editor-container ${viewMode}`}>
        <div className="input-area">
          <textarea
            ref={textareaRef}
            value={internalValue}
            onChange={handleChange}
            placeholder={placeholder}
            className="text-input"
          />
        </div>
        <div
          ref={previewRef}
          className="preview-area"
          dangerouslySetInnerHTML={{ __html: marked(internalValue) }}
        />
      </div>
    </div>
  );
};
