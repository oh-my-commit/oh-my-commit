export interface GcopModelConfig {
  model_name: string;
  api_key: string;
  api_base?: string;
}

export interface GcopConfig {
  model: GcopModelConfig;
  include_git_history?: boolean;
  enable_data_improvement?: boolean;
  commit_template?: string;
}

export const DEFAULT_COMMIT_TEMPLATE = `
<good_example>
<commit_message>
feat: implement user registration

- Add registration form component
- Create API endpoint for user creation
- Implement email verification process

This feature allows new users to create accounts and verifies
their email addresses before activation. It includes proper
input validation and error handling.
</commit_message>
<reason>contain relevant detail of the changes, not just one line</reason>
</good_example>

<bad_example>
<commit_message>feat: add user registration</commit_message>
<reason>only one line, need more detail based on guidelines</reason>
</bad_example>
`;
