"use strict";
/**
 * Generic Tailwind CSS Theme Plugin Generator
 *
 * This module provides a flexible way to create Tailwind plugins that can transform
 * any CSS variables into Tailwind-compatible theme values with support for opacity.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTailwindThemePlugin = createTailwindThemePlugin;
const plugin_1 = __importDefault(require("tailwindcss/plugin"));
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
function createTailwindThemePlugin(config) {
    const { mapping, pluginOptions = {} } = config;
    return (0, plugin_1.default)(function ({ addBase, addUtilities, addComponents }) {
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
    }, {
        theme: {
            extend: {
                colors: Object.entries(mapping).reduce((acc, [key, value]) => {
                    acc[key] = typeof value === "function" ? value(key) : value;
                    return acc;
                }, {}),
            },
        },
    });
}
