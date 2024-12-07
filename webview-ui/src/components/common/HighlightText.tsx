import React from 'react';
import { cn } from '../../lib/utils';

interface HighlightTextProps {
  text: string;
  highlight: string;
  className?: string;
}

export const HighlightText: React.FC<HighlightTextProps> = ({
  text,
  highlight,
  className
}) => {
  if (!highlight.trim()) {
    return <span className={className}>{text}</span>;
  }

  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));

  return (
    <span className={className}>
      {parts.map((part, i) => 
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={i} className="bg-yellow-500/20 text-inherit rounded px-[2px]">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
};
