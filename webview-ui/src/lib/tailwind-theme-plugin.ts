/**
 * Generic Tailwind CSS Theme Plugin Generator
 *
 * This module provides a flexible way to create Tailwind plugins that can transform
 * any CSS variables into Tailwind-compatible theme values with support for opacity.
 */

import plugin from "tailwindcss/plugin";

export type ThemePluginConfig = {
  /** List of variable names without prefix */
  inputs: string[];
  /** Optional function to transform CSS variable name and value */
  transform?: {
    /** Transform the variable name to CSS variable format (default: name => `--${prefix}-${name}`) */
    input2field?: (name: string) => string;
    /** Transform the CSS variable into a Tailwind-compatible value (default: cssVar => `var(${cssVar})`) */
    input2value?: (name: string) => string;
  };
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
 * // Create a plugin for custom brand colors
 * const brandTheme = createTailwindThemePlugin({
 *   prefix: 'brand',
 *   variables: ['primary', 'secondary'],
 *   transform: {
 *     value: cssVar => `rgb(var(${cssVar}) / <alpha-value>)`
 *   }
 * });
 * ```
 */
export function createTailwindThemePlugin(config: ThemePluginConfig) {
  const { inputs: variables, transform = {}, pluginOptions = {} } = config;

  return plugin(
    function ({ addBase, addUtilities, addComponents }) {
      // Add any base styles if needed
      if (pluginOptions.addBase && addBase) {
        addBase({});
      }

      // Add any utilities if needed
      if (pluginOptions.addUtilities && addUtilities) {
        addUtilities({});
      }

      // Add any components if needed
      if (pluginOptions.addComponents && addComponents) {
        addComponents({});
      }
    },
    {
      theme: {
        extend: {
          colors: variables.reduce<Record<string, string>>((acc, name) => {
            acc[transform.input2field?.(name) || name] =
              transform.input2value?.(name) || `var(${name})`;
            return acc;
          }, {}),
        },
      },
    }
  );
}
