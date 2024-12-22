# TODO List

## Build System

### Watch Mode Improvement

**Priority**: Medium  
**Status**: Pending  
**Created**: 2024-12-22

#### Problem

tsup's watch mode doesn't detect changes in workspace dependencies (e.g., shared package) in our monorepo setup.

#### Current Workaround

Currently, developers need to manually rebuild when making changes to the shared package.

#### Potential Solutions

1. Use chokidar to watch shared package files
   - Pros: Direct file system watching
   - Cons: Additional dependency
2. Integrate with turborepo's watch feature
   - Pros: Native monorepo support
   - Cons: Requires turborepo setup
3. Use nodemon for development
   - Pros: Simple to implement
   - Cons: Additional tooling

#### Related Issues

- tsup issue: https://github.com/egoist/tsup/issues/647
- turbo issue: https://github.com/vercel/turbo/issues/986

#### Next Steps

1. Research the impact on development workflow
2. Evaluate each solution's trade-offs
3. Implement the chosen solution
4. Add tests for the watch mode
5. Update documentation
