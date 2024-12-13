/**
 * Get the basename (filename) from a path
 */
export const basename = (path: string): string => {
  const parts = path.split('/');
  return parts[parts.length - 1];
};
