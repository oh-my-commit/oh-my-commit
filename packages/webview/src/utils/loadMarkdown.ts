/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-26
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const MARKDOWN_URLS = {
  "commit-specification":
    "https://raw.githubusercontent.com/cs-magic-open/oh-my-commit/main/packages/website/docs/yet-another-best-practice/commit-specification.md",
}

export const loadMarkdown = async (name: "commit-specification"): Promise<string> => {
  const url = MARKDOWN_URLS[name]
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch markdown: ${response.statusText}`)
    }
    const text = await response.text()
    // Remove HTML comments from the markdown content
    return text.replace(/<!--[\s\S]*?-->/g, "")
  } catch (error) {
    console.error("Error loading markdown:", error)
    return "Failed to load markdown content. Please try again later."
  }
}
