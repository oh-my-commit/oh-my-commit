# Commit Specification

<!-- toc -->[Examples](#examples)<!-- tocstop -->

Write clear and meaningful commit messages that describe your changes.

Follow the format:

```commit
type: subject

body
```

## Examples

### Simple Change

```commit
fix: correct button alignment in header
```

### Feature Addition

```commit
feat: add dark mode support

- Add theme toggle button
- Implement system theme detection
- Update colors for dark theme
```

### Breaking Change

```commit
feat!: migrate authentication to OAuth 2.0

BREAKING CHANGE: The previous JWT-based auth is removed.
New OAuth flow requires additional setup:

- Update client configuration
- Add OAuth callback endpoint
- Migrate existing tokens

Migration guide: https://example.com/oauth-migration
```
