import { Loggable } from "@/types/mixins";
import * as vscode from "vscode";

export interface VscodeCommand {
  id: string;
  execute(): Promise<void>;
}

class EmptyBase {}

export abstract class BaseCommand
  extends Loggable(EmptyBase)
  implements VscodeCommand
{
  abstract id: string;

  constructor() {
    super();
    this.logger = vscode.window.createOutputChannel("Oh My Commits - Command", {
      log: true,
    });
  }

  abstract execute(): Promise<void>;

  dispose(): void {
    this.logger.dispose();
  }
}
