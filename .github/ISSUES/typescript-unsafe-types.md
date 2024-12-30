---
title: "TypeScript: Improve Type Safety Without Excessive Warnings"
labels: ["typescript", "enhancement", "help wanted"]
assignees: []
---

## Issue Description

Currently, we're encountering numerous TypeScript ESLint warnings related to unsafe type operations, particularly:
- `@typescript-eslint/no-unsafe-assignment`
- `@typescript-eslint/no-unsafe-member-access`
- `@typescript-eslint/no-unsafe-return`
- `@typescript-eslint/no-unsafe-argument`

We've temporarily disabled these rules in `.eslintrc.js`, but this reduces type safety. We need a better solution.

## Current Situation

1. These warnings appear frequently when:
   - Using template strings for command IDs
   - Cross-package references
   - Using third-party libraries

2. Current workaround:
   ```javascript
   rules: {
     "@typescript-eslint/no-unsafe-member-access": "off",
     "@typescript-eslint/no-unsafe-assignment": "off",
     "@typescript-eslint/no-unsafe-return": "off",
     "@typescript-eslint/no-unsafe-argument": "off"
   }
   ```

## Desired Outcome

We need a solution that:
1. Maintains type safety
2. Reduces false positive warnings
3. Improves developer experience

## Possible Solutions

1. Define strict types for command IDs:
   ```typescript
   type CommandId = `${string}.${string}`
   const COMMAND_QUICK_COMMIT: CommandId = `${APP_ID_CAMEL}.quickCommit`
   ```

2. Use const enums or satisfies operator:
   ```typescript
   const enum Commands {
     QuickCommit = "ohMyCommit.quickCommit"
   }
   ```

3. Improve cross-package type definitions

## Questions

1. What's the best practice for handling template string types in TypeScript?
2. How to properly type cross-package references?
3. Are there better alternatives to the current command ID system?

## Additional Context

- [Documentation](./docs/typescript/unsafe-types.md)
- TypeScript version: 5.3.3
- ESLint version: 8.57.1
