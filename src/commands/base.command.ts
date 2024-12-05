import { GitManager } from '@/managers/git.manager';
import { SolutionManager } from '@/managers/solution.manager';

export abstract class BaseCommand {
    constructor(
        public readonly id: string,
        protected readonly gitManager: GitManager,
        protected readonly solutionManager: SolutionManager
    ) {}

    abstract execute(): Promise<void>;

    protected async validateGitRepository(): Promise<boolean> {
        if (!(await this.gitManager.isGitRepository())) {
            console.log('Not a git repository');
            return false;
        }
        return true;
    }

    protected async validateSolution(): Promise<boolean> {
        const solution = await this.solutionManager.getCurrentSolution();
        if (!solution) {
            console.log('No solution selected');
            return false;
        }
        return true;
    }
}
