# VSCode Extension Development Guide

## Best Practices

### Provider Integration

The Oh My Commit VSCode extension comes with built-in provider support. Here's how we handle provider integration:

#### Directory Structure

```
dist/
  ├── main/          # Extension main code
  └── providers/     # Provider files
      └── official/  # Official provider
```

#### Build Configuration

1. Provider Build (`packages/provider-official/tsup.config.ts`):
```typescript
export default defineConfig({
  ...baseConfig,
  entry: {
    index: "src/index.ts",
  },
  outDir: "../../dist/providers/official", // Build directly to extension's dist directory
  format: ["cjs", "esm"],
  noExternal: [/.*/], // Package all dependencies
})
```

2. Extension Activation (`packages/extension/src/extension.ts`):
```typescript
export function activate(context: vscode.ExtensionContext) {
  try {
    // Ensure provider directory exists
    const providerDir = path.join(os.homedir(), '.oh-my-commit/providers/official')
    if (!fs.existsSync(providerDir)) {
      fs.mkdirSync(providerDir, { recursive: true })
    }

    // Copy built-in provider files to user directory
    const builtinProviderPath = path.join(context.extensionPath, "dist/providers/official")
    if (fs.existsSync(builtinProviderPath)) {
      fs.cpSync(builtinProviderPath, providerDir, { recursive: true })
      logger.info("Successfully installed official provider")
    }

    // Continue with extension initialization
    ...
  } catch (error) {
    ...
  }
}
```

#### How It Works

1. During build time:
   - Provider files are built directly to `dist/providers/official`
   - These files are included in the `.vsix` package

2. During runtime:
   - When the extension activates, it checks if the provider is installed in the user's directory
   - If not, it copies the built-in provider files to `~/.oh-my-commit/providers/official`

This approach ensures that:
- Users get the official provider automatically with the extension
- Provider files are always in sync with the extension version
- No additional installation steps are required
- The provider can be easily updated with extension updates
