/**
 * Generic Tailwind CSS Theme Plugin Generator
 *
 * This module provides a flexible way to create Tailwind plugins that can transform
 * any CSS variables into Tailwind-compatible theme values with support for opacity.
 */
export type ThemePluginConfig = {
    /**
     * Map of Tailwind class names to their corresponding values
     * Key: Tailwind class name (e.g., 'primary', 'bg-default')
     * Value: CSS value or transformation function
     */
    mapping: Record<string, string | ((key: string) => string)>;
    /** Optional configuration for the plugin */
    pluginOptions?: {
        /** Whether to add base styles */
        addBase?: boolean;
        /** Whether to add utilities */
        addUtilities?: boolean;
        /** Whether to add components */
        addComponents?: boolean;
    };
};
/**
 * Creates a Tailwind plugin that transforms CSS variables into theme values
 *
 * @param config Plugin configuration
 * @returns Tailwind plugin
 *
 * @example
 * ```ts
 * // Create a plugin for VSCode theme
 * const vscodeTheme = createTailwindThemePlugin({
 *   mapping: {
 *     'editor-bg': '--vscode-editor-background',
 *     'primary': name => `rgb(from var(--vscode-${name}) r g b / <alpha-value>)`
 *   }
 * });
 * ```
 */
export declare function createTailwindThemePlugin(config: ThemePluginConfig): {
    handler: import("tailwindcss/types/config").PluginCreator;
    config?: Partial<import("tailwindcss/types/config").Config>;
};
