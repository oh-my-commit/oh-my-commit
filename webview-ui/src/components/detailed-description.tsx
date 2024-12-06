import React from "react";
import "./detailed-description.css";
import { marked } from "marked";

type ViewMode = 'plain' | 'split' | 'preview';

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
  const [viewMode, setViewMode] = React.useState<ViewMode>('split');

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
      <div className={`editor-container ${viewMode}`}>
        {viewMode !== 'preview' && (
          <div className="input-area">
            <textarea
              ref={textareaRef}
              value={internalValue}
              onChange={handleChange}
              placeholder={placeholder}
              className="text-input"
            />
          </div>
        )}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div 
            className="preview-area"
            dangerouslySetInnerHTML={{ __html: marked(internalValue) }}
          />
        )}
        <div className="view-toggles">
          <button
            className={viewMode === 'plain' ? 'active' : ''}
            onClick={() => setViewMode('plain')}
            title="Plain text"
          >
            <i className="codicon codicon-file-text"></i>
          </button>
          <button
            className={viewMode === 'split' ? 'active' : ''}
            onClick={() => setViewMode('split')}
            title="Split view"
          >
            <i className="codicon codicon-split-horizontal"></i>
          </button>
          <button
            className={viewMode === 'preview' ? 'active' : ''}
            onClick={() => setViewMode('preview')}
            title="Preview"
          >
            <i className="codicon codicon-preview"></i>
          </button>
        </div>
      </div>
    </div>
  );
};
