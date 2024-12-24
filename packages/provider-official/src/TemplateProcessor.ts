import { readFileSync } from "fs";
import Handlebars from "handlebars";
import { memoize } from "lodash-es";
import { join } from "path";

export class TemplateProcessor {
  private readonly getTemplate = memoize(() => {
    const TEMPLATE_PATH = join(__dirname, "../templates/commit-prompt.hbs");
    const template = readFileSync(TEMPLATE_PATH, "utf-8");
    return Handlebars.compile(template);
  });

  loadPrompt(input: { lang: string; diff: string; }) {
    const template = this.getTemplate();
    return template(input);
  }
}
