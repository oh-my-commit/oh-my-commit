import { FileChange, FileStatus } from '../types/git';

/**
 * 解析 Git 状态输出
 */
export function parseGitStatus(statusOutput: string): FileChange[] {
  return statusOutput
    .split('\n')
    .filter(Boolean)
    .map(line => {
      const [status, path] = line.trim().split(' ');
      return {
        path,
        type: parseGitStatusCode(status),
        status: parseGitStatusCode(status),
        additions: 0,
        deletions: 0
      };
    });
}

/**
 * 解析 Git 状态码
 */
export function parseGitStatusCode(code: string): FileStatus {
  const statusMap: Record<string, FileStatus> = {
    'A': 'added',
    'M': 'modified',
    'D': 'deleted',
    'R': 'renamed',
  };
  return statusMap[code] || 'default';
}

/**
 * 统计文件变更
 */
export function calculateChanges(files: FileChange[]) {
  return files.reduce((stats, file) => {
    stats.total++;
    stats[file.status]++;
    stats.additions += file.additions;
    stats.deletions += file.deletions;
    return stats;
  }, {
    added: 0,
    modified: 0,
    deleted: 0,
    renamed: 0,
    total: 0,
    additions: 0,
    deletions: 0
  });
}
