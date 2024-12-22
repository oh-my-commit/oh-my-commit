export interface VscodeCommand {
  id: string
  execute(): Promise<void>
}

export interface BaseCommand extends VscodeCommand {
  dispose(): void
}
