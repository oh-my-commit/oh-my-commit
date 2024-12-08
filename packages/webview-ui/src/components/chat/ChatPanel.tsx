import React, { useState, useEffect } from 'react';
import { vscode } from '../../utilities/vscode';
import { Section } from '../layout/Section';

interface ChatMessage {
  sequence: number;
  user_input: string;
  assistant_response: string;
  timestamp: string;
}

interface ChatPanelProps {
  onSend?: (message: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ onSend }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    // Load current conversation when component mounts
    vscode.postMessage({ type: 'GET_CURRENT_CONVERSATION' });
  }, []);

  useEffect(() => {
    const messageHandler = (event: MessageEvent) => {
      const message = event.data;
      switch (message.type) {
        case 'UPDATE_CONVERSATION':
          if (message.conversation?.rounds) {
            setMessages(message.conversation.rounds);
          }
          break;
      }
    };

    window.addEventListener('message', messageHandler);
    return () => window.removeEventListener('message', messageHandler);
  }, []);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    onSend?.(inputValue);
    setInputValue('');

    // Send message to extension
    vscode.postMessage({
      type: 'SEND_MESSAGE',
      message: inputValue
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Section title="Chat">
      <Section.Content>
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.sequence} className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="p-2 bg-[var(--vscode-editor-background)] rounded">
                    {msg.user_input}
                  </div>
                </div>
                <div className="flex items-start gap-2 justify-end">
                  <div className="p-2 bg-[var(--vscode-button-background)] text-[var(--vscode-button-foreground)] rounded">
                    {msg.assistant_response}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-[var(--vscode-panel-border)]">
            <div className="flex gap-2">
              <textarea
                className="flex-1 min-h-[40px] max-h-[120px] p-2 bg-[var(--vscode-input-background)] text-[var(--vscode-input-foreground)] border border-[var(--vscode-input-border)] rounded resize-none"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
              />
              <button
                className="px-4 py-2 bg-[var(--vscode-button-background)] text-[var(--vscode-button-foreground)] rounded hover:bg-[var(--vscode-button-hoverBackground)]"
                onClick={handleSend}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </Section.Content>
    </Section>
  );
};
