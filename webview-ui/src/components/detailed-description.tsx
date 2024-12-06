import React, { useCallback, useEffect, useRef, useState } from "react";
import { marked } from "marked";
import classnames from "classnames";
import "./detailed-description.css";

interface Props {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

type ViewMode = 'plain' | 'split' | 'preview';

export const DetailedDescription: React.FC<Props> = ({
  value,
  placeholder,
  onChange,
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 同步外部值
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // 自动调整文本区域高度
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const height = Math.max(150, textarea.scrollHeight);
    textarea.style.height = `${height}px`;
  }, []);

  // 处理文本变化
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange(newValue);
  }, [onChange]);

  // 监听内容变化时调整高度
  useEffect(() => {
    adjustTextareaHeight();
  }, [adjustTextareaHeight, internalValue]);

  // 监听视图模式变化时调整高度
  useEffect(() => {
    adjustTextareaHeight();
  }, [adjustTextareaHeight, viewMode]);

  return (
    <div className="detailed-description">
      <div className="view-mode-buttons">
        <button
          className={classnames('mode-button', { active: viewMode === 'plain' })}
          onClick={() => setViewMode('plain')}
        >
          Plain
        </button>
        <button
          className={classnames('mode-button', { active: viewMode === 'split' })}
          onClick={() => setViewMode('split')}
        >
          Split
        </button>
        <button
          className={classnames('mode-button', { active: viewMode === 'preview' })}
          onClick={() => setViewMode('preview')}
        >
          Preview
        </button>
      </div>
      <div
        className={classnames("editor-container", {
          'mode-plain': viewMode === 'plain',
          'mode-split': viewMode === 'split',
          'mode-preview': viewMode === 'preview'
        })}
      >
        <textarea
          ref={textareaRef}
          value={internalValue}
          onChange={handleChange}
          placeholder={placeholder}
        />
        <div
          className="preview-content"
          dangerouslySetInnerHTML={{
            __html: marked(internalValue),
          }}
        />
      </div>
    </div>
  );
};
