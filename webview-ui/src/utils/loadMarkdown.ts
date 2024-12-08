import commitFormatMd from '../docs/commit-format.md';

export const loadMarkdown = (name: string): string => {
  const markdownFiles = {
    'commit-format': commitFormatMd
  };
  
  return markdownFiles[name] || '';
};
