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

    if (!textarea || !container) return;

    // 重置文本区域高度以获取准确的 scrollHeight
    textarea.style.height = "auto";
    
    // 确保在下一帧获取正确的 scrollHeight
    requestAnimationFrame(() => {
      const textHeight = Math.max(150, textarea.scrollHeight);

      if (viewMode === "plain") {
        textarea.style.height = `${textHeight}px`;
      } else if (viewMode === "preview" && preview) {
        const previewHeight = Math.max(150, preview.scrollHeight);
        container.style.height = `${previewHeight}px`;
      } else if (viewMode === "split" && preview) {
        textarea.style.height = `${textHeight}px`;
        const previewHeight = Math.max(150, preview.scrollHeight);
        container.style.height = `${Math.max(textHeight, previewHeight)}px`;
      }
    });
  };

  // 在组件挂载和内容变化时重新计算高度
  useEffect(() => {
    calculateHeight();
  }, [internalValue]);

  // 在视图模式变化时重新计算高度
  useEffect(() => {
    // 等待 DOM 完全更新后再计算高度
    const timer = setTimeout(() => {
      calculateHeight();
      // 再次计算以确保获取正确高度（处理一些边缘情况）
      requestAnimationFrame(() => {
        calculateHeight();
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [viewMode]);

  // 监听预览区域的内容变化
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (viewMode === "preview" || viewMode === "split") {
        calculateHeight();
      }
    });

    if (previewRef.current) {
      observer.observe(previewRef.current);
    }

    return () => observer.disconnect();
  }, [viewMode]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    calculateHeight();
  };

  const handleViewChange = (mode: ViewMode) => {
    if (mode === viewMode) return;
    
    // 在模式切换前重置容器高度
    const container = containerRef.current;
    if (container) {
      container.style.height = "auto";
    }
    
    setViewMode(mode);
  };

  return (
    <div className="detailed-description">
      <div ref={containerRef} className={classnames("editor-container", viewMode)}>
        {(viewMode === "plain" || viewMode === "split") && (
          <textarea
            ref={textareaRef}
            value={internalValue}
            onChange={handleChange}
            placeholder={placeholder}
          />
        )}
        {(viewMode === "preview" || viewMode === "split") && (
          <div
            ref={previewRef}
            className="preview-content"
            dangerouslySetInnerHTML={{
              __html: marked(internalValue),
            }}
          />
        )}
      </div>
      <div className="mode-selector">
        <button
          className={classnames({ active: viewMode === "plain" })}
          onClick={() => handleViewChange("plain")}
        >
          Plain
        </button>
        <button
          className={classnames({ active: viewMode === "preview" })}
          onClick={() => handleViewChange("preview")}
        >
          Preview
        </button>
        <button
          className={classnames({ active: viewMode === "split" })}
          onClick={() => handleViewChange("split")}
        >
          Split
        </button>
      </div>
    </div>
  );
};
