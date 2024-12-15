import { workspace } from "vscode";

export class VscodeEnv {
  static get config() {
    return workspace.getConfiguration("omc");
  }
}
