import { getConversationManager } from '../extension';

export class ConversationService {
  private static instance: ConversationService;

  private constructor() {}

  static getInstance(): ConversationService {
    if (!ConversationService.instance) {
      ConversationService.instance = new ConversationService();
    }
    return ConversationService.instance;
  }

  async processUserMessage(message: string): Promise<string> {
    const manager = getConversationManager();
    const response = manager.processUserInput(message);
    
    if (response) {
      return response;
    }

    // Here you would typically:
    // 1. Process the message with your AI logic
    // 2. Generate a response
    // 3. Add the response to the conversation log
    const aiResponse = await this.generateAIResponse(message);
    manager.addAssistantResponse(aiResponse);
    
    return aiResponse;
  }

  private async generateAIResponse(message: string): Promise<string> {
    // Implement your AI response generation logic here
    return "AI response placeholder";
  }

  getCurrentConversation() {
    return getConversationManager().getCurrentConversation();
  }

  listConversations() {
    return getConversationManager().listConversations();
  }
}
