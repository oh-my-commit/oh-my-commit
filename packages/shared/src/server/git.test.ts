/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-28
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
/// <reference types="jest" />
import simpleGit, { DiffResult, SimpleGit } from "simple-git"

import { ConsoleLogger } from "../common/log"
import { GitCore } from "./git"

jest.mock("simple-git", () => {
  const mockSimpleGit = jest.fn()
  return jest.fn(() => mockSimpleGit)
})

describe("GitCore", () => {
  let gitCore: GitCore
  let mockGit: jest.Mocked<SimpleGit>
  let mockLogger: ConsoleLogger
  const workspaceRoot = "/test/workspace"

  beforeEach(() => {
    mockGit = {
      diffSummary: jest.fn(),
      add: jest.fn(),
      commit: jest.fn(),
      status: jest.fn(),
      log: jest.fn(),
      diff: jest.fn(),
    } as unknown as jest.Mocked<SimpleGit>
    ;(simpleGit as jest.MockedFunction<typeof simpleGit>).mockReturnValue(
      mockGit
    )

    mockLogger = new ConsoleLogger()
    jest.spyOn(mockLogger, "debug").mockImplementation(jest.fn())
    jest.spyOn(mockLogger, "info").mockImplementation(jest.fn())
    jest.spyOn(mockLogger, "warn").mockImplementation(jest.fn())
    jest.spyOn(mockLogger, "error").mockImplementation(jest.fn())

    gitCore = new GitCore(workspaceRoot, mockLogger)
  })

  describe("getDiffResult", () => {
    it("should return diff summary for staged files without renames", async () => {
      const mockDiffSummary: DiffResult = {
        files: [
          {
            file: "file1.ts",
            changes: 10,
            insertions: 8,
            deletions: 2,
            binary: false as const,
            similarity: 100,
          },
          {
            file: "file2.ts",
            changes: 5,
            insertions: 3,
            deletions: 2,
            binary: false as const,
            similarity: 100,
          },
        ],
        insertions: 11,
        deletions: 4,
        changed: 2,
      }

      const diffSummarySpy = jest.spyOn(mockGit, "diffSummary")
      diffSummarySpy.mockResolvedValue(mockDiffSummary)

      const result = await gitCore.getDiffResult(false)

      expect(diffSummarySpy).toHaveBeenCalledWith(["--staged"])
      expect(result).toEqual(mockDiffSummary)
    })

    it("should handle renamed files in diff summary", async () => {
      const mockDiffSummary: DiffResult = {
        files: [
          {
            file: "newfile.ts",
            changes: 0,
            insertions: 0,
            deletions: 0,
            binary: false as const,
            similarity: 100,
            from: "oldfile.ts",
          } as {
            file: string
            changes: number
            insertions: number
            deletions: number
            binary: false
            similarity: number
            from: string
          },
          {
            file: "file2.ts",
            changes: 5,
            insertions: 3,
            deletions: 2,
            binary: false as const,
            similarity: 100,
          },
        ],
        insertions: 3,
        deletions: 2,
        changed: 2,
      }

      const diffSummarySpy = jest.spyOn(mockGit, "diffSummary")
      diffSummarySpy.mockResolvedValue(mockDiffSummary)

      const result = await gitCore.getDiffResult(true)

      expect(diffSummarySpy).toHaveBeenCalledWith(["--staged"])
      expect(result).toEqual(mockDiffSummary)

      // Type assertion for renamed file
      const renamedFile = result.files[0] as { from?: string }
      expect(renamedFile.from).toBe("oldfile.ts")
    })

    it("should handle empty diff summary", async () => {
      const mockDiffSummary: DiffResult = {
        files: [],
        insertions: 0,
        deletions: 0,
        changed: 0,
      }

      const diffSummarySpy = jest.spyOn(mockGit, "diffSummary")
      diffSummarySpy.mockResolvedValue(mockDiffSummary)

      const result = await gitCore.getDiffResult()

      expect(diffSummarySpy).toHaveBeenCalledWith(["--staged"])
      expect(result).toEqual(mockDiffSummary)
    })

    it("should handle errors in diff summary", async () => {
      const error = new Error("Git diff failed")
      const diffSummarySpy = jest.spyOn(mockGit, "diffSummary")
      diffSummarySpy.mockRejectedValue(error)

      await expect(gitCore.getDiffResult()).rejects.toThrow("Git diff failed")
    })
  })
})
