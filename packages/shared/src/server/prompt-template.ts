import { TEMPLATES_DIR } from "@shared/server/config"
import { readFileSync } from "fs"
import Handlebars, { type TemplateDelegate } from "handlebars"
import { memoize } from "lodash-es"
import { join } from "path"

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
