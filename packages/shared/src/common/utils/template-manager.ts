import { readFileSync } from "fs";
import { join } from "path";
import * as Handlebars from "handlebars";

export class TemplateManager {
  private static instance: TemplateManager;
  private templates: Map<string, HandlebarsTemplateDelegate>;
  private templateDir: string;

  private constructor(templateDir: string) {
    this.templates = new Map();
    this.templateDir = templateDir;
  }

  public static getInstance(templateDir?: string): TemplateManager {
    if (!TemplateManager.instance) {
      if (!templateDir) {
        throw new Error(
          "Template directory must be provided when initializing TemplateManager"
        );
      }
      TemplateManager.instance = new TemplateManager(templateDir);
    }
    return TemplateManager.instance;
  }

  /**
   * 加载指定模板文件
   * @param templateName 模板名称（不包含扩展名）
   * @returns 编译后的模板函数
   */
  public loadTemplate(templateName: string): HandlebarsTemplateDelegate {
    if (this.templates.has(templateName)) {
      return this.templates.get(templateName)!;
    }

    const templatePath = join(this.templateDir, `${templateName}.hbs`);
    try {
      const templateSource = readFileSync(templatePath, "utf-8");
      const template = Handlebars.compile(templateSource);
      this.templates.set(templateName, template);
      return template;
    } catch (error) {
      throw new Error(
        `Failed to load template '${templateName}': ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * 使用指定模板渲染数据
   * @param templateName 模板名称（不包含扩展名）
   * @param data 要渲染的数据
   * @returns 渲染后的字符串
   */
  public render<T extends object>(templateName: string, data: T): string {
    const template = this.loadTemplate(templateName);
    return template(data);
  }

  /**
   * 注册自定义 Handlebars 助手函数
   * @param name 助手函数名称
   * @param fn 助手函数实现
   */
  public registerHelper(name: string, fn: Handlebars.HelperDelegate): void {
    Handlebars.registerHelper(name, fn);
  }

  /**
   * 注册自定义 Handlebars 部分模板
   * @param name 部分模板名称
   * @param template 部分模板内容
   */
  public registerPartial(name: string, template: string): void {
    Handlebars.registerPartial(name, template);
  }
}
