---
title: "enhance: Improve Commit Guide Popover Implementation"
labels: ["enhancement", "webview"]
assignees: ["markshawn2020"]
---

## Background

Currently, the commit guide popover in `@packages/webview/src/components/commit/commit-guide.tsx` uses a custom adaptive positioning solution due to limitations in VSCode webview's popover support. While functional, this approach may not provide the best user experience and maintainability.

## Current Implementation

- Uses absolute positioning with custom calculations
- Relies on manual z-index management
- Implements custom event handling for positioning updates

## Problems

1. **Limited Native Support**: VSCode webview lacks native popover support, forcing custom implementations
2. **Positioning Challenges**: Manual positioning can be unreliable across different window sizes and positions
3. **Maintenance Overhead**: Custom implementation requires more maintenance than a native solution

## Proposed Solutions

### Short-term Improvements

1. Enhance current adaptive implementation:
   - Add position calculation caching
   - Implement smart boundary detection
   - Add smooth transitions for position updates

2. Consider using established libraries that work well in webview context:
   - Floating UI
   - Popper.js
   - React-tooltip (if appropriate)

### Long-term Goals

1. Track and adopt official VSCode webview UI toolkit popover implementation once available
2. Consider contributing to the official toolkit's popover implementation

## Related References

- [Popover support · Issue #407 · microsoft/vscode-webview-ui-toolkit](https://github.com/microsoft/vscode-webview-ui-toolkit/issues/407)
- [Add popovers for webview components · Issue #1434 · posit-dev/publisher](https://github.com/posit-dev/publisher/issues/1434)

## Next Steps

1. [ ] Research existing VSCode extensions with good popover implementations
2. [ ] Evaluate third-party libraries for interim solution
3. [ ] Create POC for improved positioning algorithm
4. [ ] Add automated tests for various window sizes and positions
5. [ ] Monitor VSCode webview UI toolkit for official popover support

## Technical Notes

- Current file: `@packages/webview/src/components/commit/commit-guide.tsx`
- Environment: VSCode webview (restricted sandbox)
- Tech stack: React + TypeScript
