import {GitManager} from "@/managers/git.manager";
import {SolutionManager} from "@/managers/solution.manager";
import {openPreferences} from "@/utils/open-preference";
import {BaseCommand} from "./base.command";

export class OpenPreferencesCommand extends BaseCommand {
  constructor(gitManager: GitManager, solutionManager: SolutionManager) {
    super("yaac.openPreferences", gitManager, solutionManager);
  }

  async execute(): Promise<void> {
    console.log("Open preferences command triggered");

    await openPreferences();
  }
}
