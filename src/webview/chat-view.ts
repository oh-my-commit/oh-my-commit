import * as vscode from 'vscode';
import { ConversationService } from '../services/conversation-service';

export class ChatViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private conversationService: ConversationService;

  constructor(
    private readonly _extensionUri: vscode.Uri
  ) {
    this.conversationService = ConversationService.getInstance();
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    this._setWebviewMessageListener(webviewView.webview);
  }

  private _setWebviewMessageListener(webview: vscode.Webview) {
    webview.onDidReceiveMessage(async (message) => {
      switch (message.type) {
        case 'SEND_MESSAGE':
          const response = await this.conversationService.processUserMessage(message.message);
          this._sendConversationUpdate();
          break;

        case 'GET_CURRENT_CONVERSATION':
          this._sendConversationUpdate();
          break;
      }
    });
  }

  private _sendConversationUpdate() {
    if (this._view) {
      const conversation = this.conversationService.getCurrentConversation();
      this._view.webview.postMessage({
        type: 'UPDATE_CONVERSATION',
        conversation
      });
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    // Implement your HTML generation logic here
    return `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Chat</title>
      </head>
      <body>
          <div id="root"></div>
          <script>
              // Your webview initialization code
          </script>
      </body>
      </html>`;
  }
}
