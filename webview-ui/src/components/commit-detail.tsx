import React, { useCallback, useEffect, useRef, useState } from "react";
import { marked } from "marked";
import classnames from "classnames";
import "./commit-detail.css";

interface Props {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  webviewLayout: "plain" | "split" | "preview";
  title?: string;
}

export const CommitDetail: React.FC<Props> = ({
  value,
  placeholder,
  onChange,
  webviewLayout,
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const plainTextareaRef = useRef<HTMLTextAreaElement>(null);
  const splitTextareaRef = useRef<HTMLTextAreaElement>(null);

  // 同步外部值
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // 处理文本变化
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      onChange(newValue);
    },
    [onChange]
  );

  return (
    <div className={`editor-container mode-${webviewLayout}`}>
      {/* Plain View */}
      <div
        className={classnames("view-container plain-view", {
          active: webviewLayout === "plain",
        })}
      >
        <textarea
          ref={plainTextareaRef}
          value={internalValue}
          onChange={handleChange}
          placeholder={placeholder}
          className="plain-textarea"
        />
      </div>
      {/* Split View */}
      <div
        className={classnames("view-container split-view", {
          active: webviewLayout === "split",
        })}
      >
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
      <div
        className={classnames("view-container preview-view", {
          active: webviewLayout === "preview",
        })}
      >
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
