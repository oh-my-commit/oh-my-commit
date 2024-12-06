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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.currentTarget instanceof HTMLTextAreaElement) {
      const textarea = e.currentTarget;
      const { selectionStart } = textarea;
      const textBeforeCursor = textarea.value.substring(0, selectionStart);
      const currentLine = textBeforeCursor.split("\n").pop() || "";
      const textAfterCursor = textarea.value.substring(selectionStart);

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
      else if (e.key === "Enter" && currentLine.startsWith("- ")) {
        e.preventDefault();

        // If the current line only has a bullet point and no content, remove it
        if (currentLine.trim() === "-") {
          const newValue = textBeforeCursor.slice(0, -1) + textAfterCursor;
          setInternalValue(newValue);
          onChange(newValue);
          return;
        }

        // Add a new bullet point on the next line
        const newValue = textBeforeCursor + "\n- " + textAfterCursor;

        setInternalValue(newValue);
        onChange(newValue);

        // Set cursor position after the new bullet point
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart + 3;
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
