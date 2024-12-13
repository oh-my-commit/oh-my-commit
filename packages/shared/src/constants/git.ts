/**
 * Git 相关常量
 */

export const GIT_STATUS = {
  ADDED: 'added',
  MODIFIED: 'modified',
  DELETED: 'deleted',
  RENAMED: 'renamed',
  DEFAULT: 'default'
} as const;

export const GIT_COMMANDS = {
  ADD: 'add',
  COMMIT: 'commit',
  PUSH: 'push',
  PULL: 'pull',
  STATUS: 'status'
} as const;
