export interface VscodeCommand {
  id: string;

  execute(): Promise<void>;
}
