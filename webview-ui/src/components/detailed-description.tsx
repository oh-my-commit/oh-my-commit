import React from "react";
import "./detailed-description.css";
import { marked } from "marked";

interface DetailedDescriptionProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const DetailedDescription: React.FC<DetailedDescriptionProps> = ({
  value,
  onChange,
  placeholder = "Detailed description (optional)",
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [internalValue, setInternalValue] = React.useState(value);

  React.useEffect(() => {
    setInternalValue(value);
  }, [value]);

  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [internalValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="detailed-description">
      <div className="editor-container">
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
          className="preview-area"
          dangerouslySetInnerHTML={{ __html: marked(internalValue) }}
        />
      </div>
    </div>
  );
};
