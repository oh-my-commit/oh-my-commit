#!/usr/bin/env node
/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-30
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import fs from "fs"
import { homedir } from "os"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const USERS_DIR = path.join(homedir(), ".oh-my-commit")
const PROVIDERS_DIR = path.join(USERS_DIR, "providers")
const TARGET_DIR = path.join(PROVIDERS_DIR, "official")

// Ensure directories exist
!fs.existsSync(USERS_DIR) && fs.mkdirSync(USERS_DIR, { recursive: true })
!fs.existsSync(PROVIDERS_DIR) && fs.mkdirSync(PROVIDERS_DIR, { recursive: true })
!fs.existsSync(TARGET_DIR) && fs.mkdirSync(TARGET_DIR, { recursive: true })

// Copy dist files to target directory
const sourceDir = path.join(__dirname, "..")
const copyFiles = (src: string, dest: string) => {
  const entries = fs.readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true })
      copyFiles(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

try {
  copyFiles(path.join(sourceDir, "dist"), TARGET_DIR)
  console.log("Successfully installed @oh-my-commit/provider-official")
} catch (error) {
  console.error("Failed to install provider:", error)
  process.exit(1)
}
