import MDEditor, { commands } from "@uiw/react-md-editor";
import React from "react";
import "./detailed-description.css";

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
  const [internalValue, setInternalValue] = React.useState(value);

  React.useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Helper function to get the indentation level of a line
  const getIndentationLevel = (line: string): number => {
    const match = line.match(/^\s*/);
    return match ? Math.floor(match[0].length / 2) : 0;
  };

  // Helper function to get the previous line's indentation level
  const getPreviousLineIndentLevel = (text: string, currentLineStart: number): number => {
    const lastNewline = text.lastIndexOf("\n", currentLineStart - 1);
    if (lastNewline === -1) return 0;
    
    const previousLine = text.slice(text.lastIndexOf("\n", lastNewline - 1) + 1, lastNewline);
    return getIndentationLevel(previousLine);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.currentTarget instanceof HTMLTextAreaElement) {
      const textarea = e.currentTarget;
      const { selectionStart, selectionEnd } = textarea;
      const text = textarea.value;
      const lines = text.split("\n");
      
      // Find the start and end lines of the selection
      const startLineIndex = text.slice(0, selectionStart).split("\n").length - 1;
      const endLineIndex = text.slice(0, selectionEnd).split("\n").length - 1;
      
      // Get the current line's content
      const currentLine = lines[startLineIndex];
      const isList = currentLine.trim().startsWith("- ");
      const currentIndentLevel = getIndentationLevel(currentLine);

      // Handle Tab key for indentation
      if (e.key === "Tab") {
        e.preventDefault();
        
        // Handle list indentation
        if (isList) {
          const prevIndentLevel = getPreviousLineIndentLevel(text, text.indexOf(currentLine));
          
          // Only allow indentation if it won't exceed previous level + 1
          if (!e.shiftKey && currentIndentLevel >= prevIndentLevel + 1) {
            return;
          }
        }

        // Process each line in the selection
        const newLines = lines.map((line, i) => {
          if (i >= startLineIndex && i <= endLineIndex) {
            if (e.shiftKey) {
              // Unindent: remove 2 spaces from start if they exist
              return line.replace(/^  /, "");
            } else {
              // Indent: add 2 spaces at start
              return "  " + line;
            }
          }
          return line;
        });

        const newValue = newLines.join("\n");
        const newCursorPos = e.shiftKey
          ? selectionStart - (currentLine.startsWith("  ") ? 2 : 0)
          : selectionStart + 2;

        setInternalValue(newValue);
        onChange(newValue);

        // Restore cursor position
        setTimeout(() => {
          textarea.selectionStart = newCursorPos;
          textarea.selectionEnd = newCursorPos + (selectionEnd - selectionStart);
        }, 0);
        
        return;
      }

      // Handle bullet points
      if (e.key === " " && currentLine === "-") {
        e.preventDefault();

        // Insert markdown list syntax
        const beforeText = textarea.value.slice(0, selectionStart);
        const afterText = textarea.value.slice(selectionStart);
        const newValue = `${beforeText} ${afterText}`;

        setInternalValue(newValue);
        onChange(newValue);

        // Set cursor position after the bullet point
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
        }, 0);
      }
      // Handle Enter key for continuing lists
      else if (e.key === "Enter" && currentLine.trim().startsWith("- ")) {
        e.preventDefault();

        const indentation = currentLine.match(/^\s*/)?.[0] || "";
        const contentAfterBullet = currentLine.slice(indentation.length + 2).trim();

        // If the current line only has a bullet point and no content, remove it and its indentation
        if (!contentAfterBullet) {
          const lineStart = text.lastIndexOf("\n", selectionStart - 1) + 1;
          const newValue = text.slice(0, lineStart) + text.slice(selectionStart);
          setInternalValue(newValue);
          onChange(newValue);
          return;
        }

        // Add a new bullet point on the next line with the same indentation
        const newValue = text.slice(0, selectionStart) + 
          "\n" + indentation + "- " + 
          text.slice(selectionEnd);

        setInternalValue(newValue);
        onChange(newValue);

        // Set cursor position after the new bullet point
        const newCursorPos = selectionStart + 1 + indentation.length + 2;
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = newCursorPos;
        }, 0);
      }
    }
  };

  const handleChange = (val: string | undefined) => {
    const newValue = val || "";
    setInternalValue(newValue);
    onChange(newValue);
  };

  const extraCommands = React.useMemo(
    () => [
      commands.group([], {
        name: "extra",
        groupName: "extra",
        icon: <></>,
        children: ({ textApi }) => {
          return [];
        },
      }),
    ],
    []
  );

  return (
    <div className="detailed-description">
      <MDEditor
        value={internalValue}
        onChange={handleChange}
        preview="live"
        hideToolbar={false}
        commands={extraCommands}
        textareaProps={{
          placeholder,
          onKeyDown: handleKeyDown,
        }}
        height={150}
      />
    </div>
  );
};
