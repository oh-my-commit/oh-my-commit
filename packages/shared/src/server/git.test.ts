/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
/// <reference types="jest" />
import * as fs from "fs"
import * as os from "os"
import * as path from "path"
import { type DiffResult } from "simple-git"
import Container from "typedi"

import { ConsoleLogger } from "../common"
import { GitCore } from "./git"

describe("GitCore", () => {
  let gitCore: GitCore
  let mockLogger: ConsoleLogger
  let tempDir: string

  beforeEach(async () => {
    // Create a temporary directory
    tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "git-test-"))

    // Initialize git repo
    await new Promise<void>((resolve, reject) => {
      const { exec } = require("child_process")
      exec("git init", { cwd: tempDir }, (error: any) => {
        if (error) reject(error)
        else resolve()
      })
    })

    mockLogger = Container.get(ConsoleLogger)
    jest.spyOn(mockLogger, "debug").mockImplementation(jest.fn())
    jest.spyOn(mockLogger, "info").mockImplementation(jest.fn())
    jest.spyOn(mockLogger, "warn").mockImplementation(jest.fn())
    jest.spyOn(mockLogger, "error").mockImplementation(jest.fn())

    gitCore = new GitCore(tempDir, mockLogger)
  })

  afterEach(async () => {
    // Clean up temporary directory
    await fs.promises.rm(tempDir, { recursive: true, force: true })
  })

  describe("getDiffResult", () => {
    it("should return diff summary for staged files without renames", async () => {
      // Create and stage a new file
      const file1Path = path.join(tempDir, "file1.ts")
      const file2Path = path.join(tempDir, "file2.ts")

      await fs.promises.writeFile(file1Path, "console.log('test1')")
      await fs.promises.writeFile(file2Path, "console.log('test2')")

      await new Promise<void>((resolve, reject) => {
        const { exec } = require("child_process")
        exec("git add .", { cwd: tempDir }, (error: any) => {
          if (error) reject(error)
          else resolve()
        })
      })

      const result = await gitCore.getDiffResult(false)

      expect(result.files).toHaveLength(2)
      // 确保文件存在并按字母顺序排序
      const sortedFiles = [...result.files].sort((a, b) => a.file.localeCompare(b.file))
      expect(sortedFiles.length).toBe(2)
      expect(sortedFiles[0]?.file).toBe("file1.ts")
      expect(sortedFiles[1]?.file).toBe("file2.ts")
      expect(result.insertions).toBeGreaterThan(0)
      expect(result.deletions).toBe(0)
    })

    it("should handle renamed files in diff summary", async () => {
      // Create and stage a file
      const oldFilePath = path.join(tempDir, "oldfile.ts")
      await fs.promises.writeFile(oldFilePath, "console.log('test')")

      await new Promise<void>((resolve, reject) => {
        const { exec } = require("child_process")
        exec("git add .", { cwd: tempDir }, (error: any) => {
          if (error) reject(error)
          else resolve()
        })
      })

      // Commit the file
      await new Promise<void>((resolve, reject) => {
        const { exec } = require("child_process")
        exec('git commit -m "Initial commit"', { cwd: tempDir }, (error: any) => {
          if (error) reject(error)
          else resolve()
        })
      })

      // Rename the file
      const newFilePath = path.join(tempDir, "newfile.ts")
      await fs.promises.rename(oldFilePath, newFilePath)

      // Stage the rename
      await new Promise<void>((resolve, reject) => {
        const { exec } = require("child_process")
        exec("git add -A", { cwd: tempDir }, (error: any) => {
          if (error) reject(error)
          else resolve()
        })
      })

      const result = await gitCore.getDiffResult(true)
      console.log(JSON.stringify(result, null, 2))

      expect(result.files).toHaveLength(1)
      const renamedFile = result.files[0] as DiffResult["files"][0] & {
        from?: string
      }
      expect(renamedFile?.file).toBe("newfile.ts")
      expect(renamedFile?.from).toBe("oldfile.ts")
    })

    it("should handle empty diff summary", async () => {
      const result = await gitCore.getDiffResult()

      expect(result.files).toHaveLength(0)
      expect(result.insertions).toBe(0)
      expect(result.deletions).toBe(0)
    })

    it("should handle errors in diff summary", async () => {
      // Corrupt git repo to cause an error
      await fs.promises.rm(path.join(tempDir, ".git"), {
        recursive: true,
        force: true,
      })

      await expect(gitCore.getDiffResult()).rejects.toThrow()
    })
  })
})
