/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-30
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { readFileSync } from "fs"
import Handlebars, { type TemplateDelegate } from "handlebars"
import { memoize } from "lodash-es"
import { join } from "path"

import { TEMPLATES_DIR } from "./path.map"

interface IFillPrompt {
  lang: string
  diff: string
}

export class PromptTemplate {
  private readonly templateName: string
  private readonly getTemplate: () => TemplateDelegate

  constructor(templateName: string) {
    this.templateName = templateName
    this.getTemplate = memoize(() => {
      const templatePath = join(TEMPLATES_DIR, `${this.templateName}.hbs`)
      const template = readFileSync(templatePath, "utf-8")
      return Handlebars.compile(template)
    })
  }

  /**
   * Assembles the final output using the template and input data
   * @param input - Template input data containing language and diff
   * @returns Assembled output containing the prompt
   */
  public fill(input: IFillPrompt): string {
    return this.getTemplate()(input)
  }
}
