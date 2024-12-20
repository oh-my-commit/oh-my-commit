# CSS Management in YetAnotherAutoCommit

<!-- toc -->

[VSCode Theme Integration](#vscode-theme-integration)

<!-- tocstop -->

## VSCode Theme Integration

### Overview

Our project uses a custom Tailwind CSS plugin to seamlessly integrate VSCode's theme variables into our application. This integration allows us to:

- Use VSCode's native theme colors in our UI
- Support dynamic theme changes
- Apply opacity modifiers to theme colors
- Maintain consistent styling with VSCode's interface

### How It Works

1. **Variable Transformation**

   - VSCode provides theme colors as CSS variables in HEX format (e.g., `--vscode-editor-background`)
   - Our plugin transforms these HEX colors into RGB format using CSS `color-mix`
   - This enables opacity support through Tailwind's opacity modifiers

2. **Usage Examples**

```css
/* Background color */
bg-vscode-editor-background

/* Text color */
text-vscode-editor-foreground

/* With opacity */
bg-vscode-diffEditor-insertedTextBackground/50
```

3. **Supported Variables**
   The plugin supports various VSCode theme variables, including:

- Editor colors (background, foreground, line highlights)
- Git decoration colors
- Input and sidebar colors
- List and selection colors

### Best Practices

1. **Using Theme Colors**

   - Always prefer VSCode theme variables over hardcoded colors
   - Use semantic color names that match VSCode's naming convention
   - Consider light/dark theme compatibility

2. **Opacity Modifiers**

   - Use opacity modifiers when you need semi-transparent elements
   - Format: `{property}-{variable-name}/{opacity}`
   - Example: `bg-vscode-editor-background/80`

3. **Maintenance**
   - Keep the variables list updated with VSCode's theme API
   - Document any new variables added to the system
   - Test color changes in both light and dark themes

### Technical Implementation

The integration is implemented through a Tailwind plugin (`vscode-theme.ts`) that:

1. Defines a list of supported VSCode variables
2. Transforms HEX colors to RGB format
3. Extends Tailwind's color palette with these variables
4. Enables opacity support through CSS color-mix

### Future Improvements

- Add type safety for theme variables
- Implement color validation
- Add support for custom theme variables
- Create a testing suite for theme consistency
