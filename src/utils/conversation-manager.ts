import { ConversationLogger } from './conversation-logger';

interface ClosingSignal {
  signal: 'aaa' | 'aa' | 'a' | 'n' | 'w';
  type: 'feat' | 'chore' | 'fix' | 'wip';
  format: string;
  response: string;
}

const CLOSING_SIGNALS: Record<string, ClosingSignal> = {
  aaa: {
    signal: 'aaa',
    type: 'feat',
    format: '✨ feat(conv_id): implement complete {topic}',
    response: '✨ 很高兴帮上忙。已提交更改，再见！'
  },
  aa: {
    signal: 'aa',
    type: 'chore',
    format: 'chore(conv_id): complete implementation of {topic}',
    response: '好的，已完成并提交。再见！'
  },
  a: {
    signal: 'a',
    type: 'fix',
    format: 'fix(conv_id): address basic requirements for {topic}',
    response: '已完成并提交。如需改进请告诉我。'
  },
  n: {
    signal: 'n',
    type: 'wip',
    format: 'wip(conv_id): progress on {topic}',
    response: '好的，请说下一个需求。'
  },
  w: {
    signal: 'w',
    type: 'chore',
    format: 'chore(conv_id): pause development of {topic}',
    response: '已保存进度，随时继续。'
  }
};

export class ConversationManager {
  private logger: ConversationLogger;
  private currentTopic: string = '';

  constructor() {
    this.logger = new ConversationLogger();
  }

  processUserInput(input: string): string {
    // Check if input is a closing signal
    const signal = CLOSING_SIGNALS[input.toLowerCase()];
    if (signal) {
      return this.handleClosingSignal(signal);
    }

    // Regular conversation processing
    if (!this.logger.getCurrentConversation()) {
      this.logger.startNewConversation(input);
      this.currentTopic = this.extractTopic(input);
    }

    return '';
  }

  private extractTopic(input: string): string {
    // Simple topic extraction - take first few words
    return input.split(' ').slice(0, 3).join(' ');
  }

  addAssistantResponse(response: string): void {
    const conversation = this.logger.getCurrentConversation();
    if (conversation) {
      const lastRound = conversation.rounds[conversation.rounds.length - 1];
      this.logger.addRound(lastRound?.user_input || '', response);
    }
  }

  private handleClosingSignal(signal: ClosingSignal): string {
    const conversation = this.logger.getCurrentConversation();
    if (!conversation) return '';

    const state = signal.signal === 'n' ? 'ongoing' : 
                 signal.signal === 'w' ? 'paused' : 
                 'completed';
                 
    const satisfaction = signal.signal === 'aaa' ? 'high' :
                        signal.signal === 'aa' ? 'high' :
                        signal.signal === 'a' ? 'medium' :
                        'medium';

    this.logger.closeConversation(state, satisfaction);

    const commitMessage = signal.format.replace('{topic}', this.currentTopic);
    return signal.response;
  }

  getCurrentConversation() {
    return this.logger.getCurrentConversation();
  }

  listConversations() {
    return this.logger.listConversations();
  }
}
