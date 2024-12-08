import * as vscode from 'vscode';
import { ConversationManager } from './utils/conversation-manager';

let conversationManager: ConversationManager;

export function activate(context: vscode.ExtensionContext) {
  // Initialize conversation manager
  conversationManager = new ConversationManager();

  // Register commands and other extension setup...
}

// Export for use in other parts of the application
export function getConversationManager(): ConversationManager {
  return conversationManager;
}
