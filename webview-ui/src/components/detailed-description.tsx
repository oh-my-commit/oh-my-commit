import React, { useCallback, useEffect, useRef, useState } from "react";
import { marked } from "marked";
import classnames from "classnames";
import "./detailed-description.css";

interface Props {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

export const DetailedDescription: React.FC<Props> = ({
  value,
  placeholder,
  onChange,
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [splitRatio, setSplitRatio] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 同步外部值
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // // 向外部同步内部值
  // useEffect(() => {
  //   onChange(internalValue);
  // }, [internalValue, onChange]);

  // 自动调整文本区域高度
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // 先将高度设为 0，这样可以正确计算 scrollHeight
    textarea.style.height = "0";

    // 然后设置为实际需要的高度
    const height = Math.max(150, textarea.scrollHeight + 20);
    textarea.style.height = `${height}px`;
  }, [textareaRef]);

  // 处理拖动开始
  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // 处理拖动过程
  const handleDrag = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const newRatio =
      ((e.clientX - containerRect.left) / containerRect.width) * 100;

    // 限制分割比例在 20% - 80% 之间
    const clampedRatio = Math.max(20, Math.min(80, newRatio));

    // 直接更新 DOM 样式
    container.style.setProperty("--split-ratio", `${clampedRatio}%`);
    setSplitRatio(clampedRatio);
  };

  // 处理拖动结束
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // 监听拖动事件
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleDrag);
      document.addEventListener("mouseup", handleDragEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleDrag);
      document.removeEventListener("mouseup", handleDragEnd);
    };
  }, [isDragging]);

  // 在内容变化时调整文本区域高度
  useEffect(() => {
    adjustTextareaHeight();
  }, [internalValue, splitRatio]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    adjustTextareaHeight();
  };

  return (
    <div
      ref={containerRef}
      className={classnames("editor-container", { dragging: isDragging })}
      style={{ "--split-ratio": `${splitRatio}%` } as React.CSSProperties}
    >
      <textarea
        ref={textareaRef}
        value={internalValue}
        onChange={handleChange}
        placeholder={placeholder}
      />
      <div className="divider" onMouseDown={handleDragStart} />
      <div
        className="preview-content"
        dangerouslySetInnerHTML={{
          __html: marked(internalValue),
        }}
      />
    </div>
  );
};
