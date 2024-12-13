/**
 * 提交消息验证规则
 */
export const COMMIT_MESSAGE_RULES = {
  minLength: 10,
  maxLength: 72,
  pattern: /^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .+/,
};

/**
 * 验证提交消息
 */
export function validateCommitMessage(message: string) {
  if (message.length < COMMIT_MESSAGE_RULES.minLength) {
    return {
      valid: false,
      error: `提交消息至少需要 ${COMMIT_MESSAGE_RULES.minLength} 个字符`
    };
  }

  if (message.length > COMMIT_MESSAGE_RULES.maxLength) {
    return {
      valid: false,
      error: `提交消息不能超过 ${COMMIT_MESSAGE_RULES.maxLength} 个字符`
    };
  }

  if (!COMMIT_MESSAGE_RULES.pattern.test(message)) {
    return {
      valid: false,
      error: '提交消息格式不正确，应该遵循 Conventional Commits 规范'
    };
  }

  return { valid: true };
}
