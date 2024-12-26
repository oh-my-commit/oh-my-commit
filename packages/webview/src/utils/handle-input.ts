/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-26
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { KeyboardEvent } from "react"

// Helper function to get the indentation level of a line
export const getIndentationLevel = (line: string): number => {
  const match = line.match(/^\s*/)
  return match ? Math.floor(match[0].length / 2) : 0
}

// Helper function to get the previous line's indentation level
export const getPreviousLineIndentLevel = (text: string, currentLineStart: number): number => {
  const lastNewline = text.lastIndexOf("\n", currentLineStart - 1)
  if (lastNewline === -1) return 0

  const previousLine = text.slice(text.lastIndexOf("\n", lastNewline - 1) + 1, lastNewline)
  return getIndentationLevel(previousLine)
}

// Handle keydown events for the markdown editor
export const handleKeyDown = (
  e: KeyboardEvent,
  text: string,
  selectionStart: number,
  selectionEnd: number,
  onChange: (value: string) => void,
  setSelectionRange: (start: number, end: number) => void,
) => {
  // Handle Tab key for indentation
  if (e.key === "Tab") {
    e.preventDefault()
    e.stopPropagation()
    console.log("Tab pressed, current state:", {
      selectionStart,
      selectionEnd,
      text,
    })

    // Split text into lines and find the affected lines
    const lines = text.split("\n")
    const startLineIndex = text.slice(0, selectionStart).split("\n").length - 1
    const endLineIndex = text.slice(0, selectionEnd).split("\n").length - 1

    console.log("Line indices:", {
      startLineIndex,
      endLineIndex,
    })

    // Process each affected line
    for (let i = startLineIndex; i <= endLineIndex; i++) {
      const line = lines[i]
      const isList = line.trim().startsWith("- ")

      console.log("Processing line:", {
        index: i,
        line,
        isList,
      })

      // For list items, check indentation limit
      if (isList && !e.shiftKey) {
        const prevIndentLevel =
          i === 0
            ? getPreviousLineIndentLevel(text, text.indexOf(line))
            : getIndentationLevel(lines[i - 1])

        console.log("List item indentation check:", {
          prevIndentLevel,
          currentLevel: getIndentationLevel(line),
        })

        // Only allow indenting one level deeper than the previous line
        if (getIndentationLevel(line) > prevIndentLevel) {
          console.log("Skipping indentation - already at max depth")
          continue
        }
      }

      // Add or remove indentation
      if (e.shiftKey) {
        if (line.startsWith("  ")) {
          lines[i] = line.slice(2)
        }
      } else {
        lines[i] = "  " + line
      }
    }

    // Join the lines back together
    const newText = lines.join("\n")
    const indentChange = e.shiftKey ? -2 : 2

    // Calculate new cursor positions
    const beforeStartLine =
      lines.slice(0, startLineIndex).join("\n").length + (startLineIndex > 0 ? 1 : 0)
    const beforeEndLine =
      lines.slice(0, endLineIndex).join("\n").length + (endLineIndex > 0 ? 1 : 0)
    const startLineLength = lines[startLineIndex].length
    const endLineLength = lines[endLineIndex].length

    console.log("Position calculations:", {
      beforeStartLine,
      beforeEndLine,
      startLineLength,
      endLineLength,
    })

    // Update text and selection
    onChange(newText)

    // Set new cursor position after a short delay to ensure the text has been updated
    setTimeout(() => {
      if (startLineIndex === endLineIndex) {
        // Single line selection
        const newPos = selectionStart + (e.shiftKey ? -2 : 2)
        if (newPos < 0) return

        console.log("Setting single line cursor position:", {
          oldStart: selectionStart,
          oldEnd: selectionEnd,
          newStart: newPos,
          newEnd:
            selectionStart === selectionEnd ? newPos : newPos + (selectionEnd - selectionStart),
        })
        setSelectionRange(
          newPos,
          selectionStart === selectionEnd ? newPos : newPos + (selectionEnd - selectionStart),
        )
      } else {
        // Multi-line selection
        const newStart = beforeStartLine + (e.shiftKey ? 0 : 2)
        const newEnd = beforeEndLine + endLineLength + (e.shiftKey ? -2 : 2)

        console.log("Setting multi-line cursor position:", {
          oldStart: selectionStart,
          oldEnd: selectionEnd,
          newStart,
          newEnd,
        })
        setSelectionRange(newStart, newEnd)
      }
    }, 0)

    return
  }

  // Handle bullet points
  const lines = text.split("\n")
  const currentLineIndex = text.slice(0, selectionStart).split("\n").length - 1
  const currentLine = lines[currentLineIndex]

  if (e.key === " " && currentLine === "-") {
    e.preventDefault()
    e.stopPropagation()
    console.log("Converting to bullet point:", {
      currentLine,
      currentLineIndex,
    })

    // Insert markdown list syntax
    lines[currentLineIndex] = "- "
    const newValue = lines.join("\n")

    onChange(newValue)

    // Set cursor position after the bullet point
    const beforeCurrentLine =
      lines.slice(0, currentLineIndex).join("\n").length + (currentLineIndex > 0 ? 1 : 0)
    setTimeout(() => {
      setSelectionRange(beforeCurrentLine + 2, beforeCurrentLine + 2)
    }, 0)
  }
  // Handle Enter key for continuing lists
  else if (e.key === "Enter" && currentLine.trim().startsWith("- ")) {
    e.preventDefault()
    e.stopPropagation()
    console.log("Continuing list:", {
      currentLine,
      currentLineIndex,
    })

    const indentation = currentLine.match(/^\s*/)?.[0] || ""
    const contentAfterBullet = currentLine.slice(indentation.length + 2).trim()

    console.log("List continuation check:", {
      indentation,
      contentAfterBullet,
      isEmpty: !contentAfterBullet,
    })

    // If the current line only has a bullet point and no content, remove it and its indentation
    if (!contentAfterBullet) {
      lines[currentLineIndex] = ""
      const newValue = lines.join("\n")
      console.log("Removing empty bullet point:", {
        oldLine: currentLine,
        newValue,
      })
      onChange(newValue)
      return
    }

    // Add a new bullet point on the next line with the same indentation
    lines.splice(currentLineIndex + 1, 0, `${indentation}- `)
    const newValue = lines.join("\n")

    console.log("Adding new bullet point:", {
      newLine: `${indentation}- `,
      newValue,
    })

    onChange(newValue)

    // Set cursor position after the new bullet point
    const beforeNewLine = lines.slice(0, currentLineIndex + 1).join("\n").length + 1
    const newCursorPos = beforeNewLine + indentation.length + 2
    console.log("New bullet point cursor position:", {
      beforeNewLine,
      indentationLength: indentation.length,
      newCursorPos,
    })
    setTimeout(() => {
      setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }
}

const handleKeyDownOriginal = (e: KeyboardEvent, onValueChange: (value: string) => void) => {
  console.log("Key pressed:", e)
  // Prevent default Tab behavior
  if (e.key === "Tab") {
    e.preventDefault()
    e.stopPropagation()
  }

  if (e.currentTarget instanceof HTMLTextAreaElement) {
    const textarea = e.currentTarget
    const { selectionStart, selectionEnd } = textarea
    const text = textarea.value

    // Handle Tab key for indentation
    if (e.key === "Tab") {
      console.log("Tab pressed, current state:", {
        selectionStart,
        selectionEnd,
        textLength: text.length,
        text,
      })

      // Split text into lines and find the affected lines
      const lines = text.split("\n")
      const startLineIndex = text.slice(0, selectionStart).split("\n").length - 1
      const endLineIndex = text.slice(0, selectionEnd).split("\n").length - 1

      console.log("Line indices:", {
        startLineIndex,
        endLineIndex,
        totalLines: lines.length,
        lines,
      })

      // Process each affected line
      for (let i = startLineIndex; i <= endLineIndex; i++) {
        const line = lines[i]
        const isList = line.trim().startsWith("- ")
        const currentIndent = getIndentationLevel(line)

        console.log(`Processing line ${i}:`, {
          originalLine: line,
          isList,
          currentIndent,
        })

        // For list items, check indentation limit
        if (isList && !e.shiftKey) {
          const prevIndentLevel =
            i === 0
              ? getPreviousLineIndentLevel(text, text.indexOf(line))
              : getIndentationLevel(lines[i - 1])

          console.log("List item indentation check:", {
            prevIndentLevel,
            currentIndent,
            canIndent: currentIndent < prevIndentLevel + 1,
          })

          if (currentIndent >= prevIndentLevel + 1) {
            continue
          }
        }

        // Apply indentation
        if (e.shiftKey) {
          const oldLine = lines[i]
          lines[i] = line.replace(/^ {2}/, "")
          console.log("Unindent line:", {
            before: oldLine,
            after: lines[i],
          })
        } else {
          const oldLine = lines[i]
          lines[i] = "  " + line
          console.log("Indent line:", {
            before: oldLine,
            after: lines[i],
          })
        }
      }

      // Join lines back together
      const newValue = lines.join("\n")
      const indentChange = e.shiftKey ? -2 : 2

      // Calculate new cursor positions
      const beforeStartLine =
        lines.slice(0, startLineIndex).join("\n").length + (startLineIndex > 0 ? 1 : 0)
      const beforeEndLine =
        lines.slice(0, endLineIndex).join("\n").length + (endLineIndex > 0 ? 1 : 0)
      const startLineLength = lines[startLineIndex].length
      const endLineLength = lines[endLineIndex].length

      console.log("Cursor position calculation:", {
        beforeStartLine,
        beforeEndLine,
        startLineLength,
        endLineLength,
        indentChange,
      })

      // Update the text
      console.log("Text update:", {
        oldValue: text,
        newValue,
        lengthChange: newValue.length - text.length,
      })

      onValueChange(newValue)

      // Adjust cursor position
      setTimeout(() => {
        if (startLineIndex === endLineIndex) {
          // Single line selection
          const newPos = selectionStart + indentChange
          console.log("Single line cursor adjustment:", {
            oldStart: selectionStart,
            oldEnd: selectionEnd,
            newStart: newPos,
            newEnd:
              selectionStart === selectionEnd ? newPos : newPos + (selectionEnd - selectionStart),
          })
          textarea.selectionStart = newPos
          textarea.selectionEnd =
            selectionStart === selectionEnd ? newPos : newPos + (selectionEnd - selectionStart)
        } else {
          // Multi-line selection
          const newStart = beforeStartLine + (e.shiftKey ? 0 : 2)
          const newEnd = beforeEndLine + endLineLength
          console.log("Multi-line cursor adjustment:", {
            oldStart: selectionStart,
            oldEnd: selectionEnd,
            newStart,
            newEnd,
          })
          textarea.selectionStart = newStart
          textarea.selectionEnd = newEnd
        }
      }, 0)

      return
    }

    // Handle bullet points
    const lines = text.split("\n")
    const currentLineIndex = text.slice(0, selectionStart).split("\n").length - 1
    const currentLine = lines[currentLineIndex]

    if (e.key === " " && currentLine === "-") {
      e.preventDefault()
      e.stopPropagation()
      console.log("Converting to bullet point:", {
        currentLine,
        currentLineIndex,
      })

      // Insert markdown list syntax
      lines[currentLineIndex] = "- "
      const newValue = lines.join("\n")

      onValueChange(newValue)

      // Set cursor position after the bullet point
      const beforeCurrentLine =
        lines.slice(0, currentLineIndex).join("\n").length + (currentLineIndex > 0 ? 1 : 0)
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = beforeCurrentLine + 2
      }, 0)
    }
    // Handle Enter key for continuing lists
    else if (e.key === "Enter" && currentLine.trim().startsWith("- ")) {
      e.preventDefault()
      e.stopPropagation() // 阻止事件继续传播
      console.log("Continuing list:", {
        currentLine,
        currentLineIndex,
      })

      const indentation = currentLine.match(/^\s*/)?.[0] || ""
      const contentAfterBullet = currentLine.slice(indentation.length + 2).trim()

      console.log("List continuation check:", {
        indentation,
        contentAfterBullet,
        isEmpty: !contentAfterBullet,
      })

      // If the current line only has a bullet point and no content, remove it and its indentation
      if (!contentAfterBullet) {
        lines[currentLineIndex] = ""
        const newValue = lines.join("\n")
        console.log("Removing empty bullet point:", {
          oldLine: currentLine,
          newValue,
        })
        onValueChange(newValue)
        return
      }

      // Add a new bullet point on the next line with the same indentation
      lines.splice(currentLineIndex + 1, 0, `${indentation}- `)
      const newValue = lines.join("\n")

      console.log("Adding new bullet point:", {
        newLine: `${indentation}- `,
        newValue,
      })

      onValueChange(newValue)

      // Set cursor position after the new bullet point
      const beforeNewLine = lines.slice(0, currentLineIndex + 1).join("\n").length + 1
      const newCursorPos = beforeNewLine + indentation.length + 2
      console.log("New bullet point cursor position:", {
        beforeNewLine,
        indentationLength: indentation.length,
        newCursorPos,
      })
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = newCursorPos
      }, 0)
    }
  }
}
