/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-27
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import plugin from "tailwindcss/plugin"

export type ThemePluginConfig = {
  /**
   * Map of Tailwind class names to their corresponding values
   * Key: Tailwind class name (e.g., 'primary', 'bg-default')
   * Value: CSS value or transformation function
   */
  mapping: Record<string, string | ((key: string) => string)>
  /** Optional configuration for the plugin */
  pluginOptions?: {
    /** Whether to add base styles */
    addBase?: boolean
    /** Whether to add utilities */
    addUtilities?: boolean
    /** Whether to add components */
    addComponents?: boolean
  }
}

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
export function createTailwindThemePlugin(config: ThemePluginConfig) {
  const { mapping, pluginOptions = {} } = config

  return plugin(
    function ({ addBase, addUtilities, addComponents }) {
      // Add any base styles if needed
      if (pluginOptions.addBase && addBase) {
        addBase({})
      }

      // Add any utilities if needed
      if (pluginOptions.addUtilities && addUtilities) {
        addUtilities({})
      }

      // Add any components if needed
      if (pluginOptions.addComponents && addComponents) {
        addComponents({})
      }
    },
    {
      theme: {
        extend: {
          colors: Object.entries(mapping).reduce<Record<string, string>>((acc, [key, value]) => {
            acc[key] = typeof value === "function" ? value(key) : value
            return acc
          }, {}),
        },
      },
    },
  )
}
