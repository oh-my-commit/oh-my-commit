import * as fs from 'fs';
import * as path from 'path';

interface ConversationRound {
  sequence: number;
  user_input: string;
  assistant_response: string;
  timestamp: string;
}

interface ConversationStatus {
  state: 'completed' | 'paused' | 'ongoing';
  satisfaction: 'high' | 'medium' | 'low';
}

interface Conversation {
  id: string;
  status: ConversationStatus;
  rounds: ConversationRound[];
}

export class ConversationLogger {
  private basePath: string;
  private currentConversation: Conversation | null = null;

  constructor() {
    this.basePath = path.join(process.cwd(), '.for-everything/conversations');
    if (!fs.existsSync(this.basePath)) {
      fs.mkdirSync(this.basePath, { recursive: true });
    }
  }

  private generateConversationId(firstMessage: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const messageHash = firstMessage.slice(0, 4).toLowerCase();
    return `${timestamp}_${messageHash}`;
  }

  private getConversationPath(id: string): string {
    return path.join(this.basePath, id);
  }

  private ensureConversationDirectory(id: string): void {
    const dirPath = this.getConversationPath(id);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  startNewConversation(firstMessage: string): void {
    const id = this.generateConversationId(firstMessage);
    this.currentConversation = {
      id,
      status: {
        state: 'ongoing',
        satisfaction: 'medium'
      },
      rounds: []
    };
    this.ensureConversationDirectory(id);
    this.saveConversation();
  }

  addRound(userInput: string, assistantResponse: string): void {
    if (!this.currentConversation) {
      this.startNewConversation(userInput);
    }

    const round: ConversationRound = {
      sequence: this.currentConversation!.rounds.length + 1,
      user_input: userInput,
      assistant_response: assistantResponse,
      timestamp: new Date().toISOString()
    };

    this.currentConversation!.rounds.push(round);
    this.saveConversation();
  }

  private saveConversation(): void {
    if (!this.currentConversation) return;

    const filePath = path.join(
      this.getConversationPath(this.currentConversation.id),
      'conversation.json'
    );

    fs.writeFileSync(
      filePath,
      JSON.stringify({ conversation: this.currentConversation }, null, 2),
      'utf-8'
    );
  }

  closeConversation(
    state: ConversationStatus['state'] = 'completed',
    satisfaction: ConversationStatus['satisfaction'] = 'high'
  ): void {
    if (!this.currentConversation) return;

    this.currentConversation.status = { state, satisfaction };
    this.saveConversation();
    this.currentConversation = null;
  }

  getCurrentConversation(): Conversation | null {
    return this.currentConversation;
  }

  loadConversation(id: string): Conversation | null {
    const filePath = path.join(this.getConversationPath(id), 'conversation.json');
    if (!fs.existsSync(filePath)) return null;

    try {
      const data = fs.readFileSync(filePath, 'utf-8');
      const { conversation } = JSON.parse(data);
      return conversation;
    } catch (error) {
      console.error(`Error loading conversation ${id}:`, error);
      return null;
    }
  }

  listConversations(): string[] {
    return fs.readdirSync(this.basePath)
      .filter(name => fs.statSync(path.join(this.basePath, name)).isDirectory());
  }
}
