import { FileChange } from '../types/git';

/**
 * Git 事件类型
 */
export type GitEventType = 
  | 'files.changed'
  | 'commit.created'
  | 'push.started'
  | 'push.completed'
  | 'error';

/**
 * Git 事件数据
 */
export interface GitEventData {
  'files.changed': {
    files: FileChange[];
    workspace: string;
  };
  'commit.created': {
    hash: string;
    message: string;
    files: FileChange[];
  };
  'push.started': {
    branch: string;
    remote: string;
  };
  'push.completed': {
    branch: string;
    remote: string;
    success: boolean;
  };
  'error': {
    code: string;
    message: string;
    command?: string;
  };
}

/**
 * Git 事件处理器类型
 */
export type GitEventHandler<T extends GitEventType> = (
  data: GitEventData[T]
) => void | Promise<void>;
