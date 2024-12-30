---
name: VSCode Extension Host Compatibility Issue with outdent
about: outdent package causes infinite loading in VSCode Extension Host environment (but works fine in webview)
title: "Bug: outdent package causes infinite loading in VSCode Extension Host"
labels: bug, vscode-extension
assignees: ""
---

## Issue Description

The `outdent` package (v0.8.0) causes infinite loading when used in a VSCode Extension Host environment. This issue specifically occurs when using template literals with the `outdent` tag function in the Extension Host context (Node.js environment).

**Important Note**: This issue is specific to the Extension Host environment. The same code works perfectly fine in the webview context (browser environment) of the VSCode extension.

## Reproduction Steps

1. Create a minimal VSCode extension with the following dependencies:

```json
{
  "dependencies": {
    "outdent": "^0.8.0"
  }
}
```

2. Use `outdent` in your extension's main code (Extension Host context):

```typescript
import outdent from "outdent"

// This will cause infinite loading in Extension Host
const html = outdent`
  <html>
    <body>
      <div>Test</div>
    </body>
  </html>
`
```

3. The same code in webview context works fine:

```typescript
// In webview/client code
import outdent from "outdent"

// This works perfectly fine
const template = outdent`
  <div>
    ${someContent}
  </div>
`
```

4. Run the extension in debug mode (F5)

## Expected Behavior

The template literal should be processed in both Extension Host and webview contexts, just as it currently works in the webview.

## Actual Behavior

- In Extension Host: The extension gets stuck in an infinite loading state
- In Webview: Works correctly as expected

## Workaround

A simple implementation without using WeakMap for caching works correctly:

```typescript
function myOutdent(strings: TemplateStringsArray, ...values: any[]) {
  const indent = strings[0].match(/(?:\r\n|\r|\n)([ \t]*)(?:[^ \t\r\n]|$)/)?.[1]?.length || 0
  const reMatchIndent = new RegExp(`(\\r\\n|\\r|\\n).{0,${indent}}`, "g")

  const outdentedStrings = strings.map((str) => str.replace(reMatchIndent, "$1"))
  let result = ""
  for (let i = 0; i < outdentedStrings.length; i++) {
    result += outdentedStrings[i]
    if (i < values.length) {
      result += values[i]
    }
  }
  return result
}
```

## Technical Analysis

The issue appears to be related to how `outdent` uses `WeakMap` for caching processed template strings:

1. `outdent` uses `WeakMap` to cache processed template literals:

```typescript
const arrayAutoIndentCache = createWeakMap<TemplateStringsArray, Array<string>>()
```

2. In the VSCode Extension Host environment, this caching mechanism seems to cause issues, possibly due to:

   - Special handling of object references in the Extension Host
   - Different garbage collection behavior
   - Cross-context object reference issues

3. The problem disappears when the caching mechanism is removed, suggesting that the issue lies in how WeakMap behaves in the Extension Host environment.

## Environment

- VSCode Version: latest
- Node Version: 16+
- outdent Version: 0.8.0
- OS: Any (issue appears to be environment-specific to VSCode Extension Host)

## Related Issues

- Reported to outdent repository: https://github.com/cspotcode/outdent/issues/26

## Additional Notes

This issue highlights a potential compatibility concern between VSCode's Extension Host environment and packages that use WeakMap for caching. Further investigation into how VSCode Extension Host handles WeakMap and object references could be valuable for the broader ecosystem.
