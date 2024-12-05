export class CommitItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['hash', 'message', 'date', 'is-preview', 'is-amend'];
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  get styles() {
    return `
      <style>
        :host {
          display: block;
        }
        .commit-item {
          display: flex;
          padding: 8px;
          border-bottom: 1px solid var(--vscode-widget-border);
          cursor: pointer;
        }
        .commit-item.preview {
          background-color: var(--vscode-editor-background);
        }
        .commit-item.to-be-amended {
          background-color: var(--vscode-diffEditor-insertedTextBackground);
        }
        .commit-item-content {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
        }
        .commit-indicator {
          width: 4px;
          height: 4px;
          border-radius: 50%;
        }
        .preview-indicator {
          background-color: var(--vscode-editorInfo-foreground);
        }
        .amend-indicator {
          background-color: var(--vscode-diffEditor-insertedTextBackground);
        }
        .commit-message {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .commit-message.has-body {
          text-decoration: underline;
          text-decoration-style: dotted;
        }
        .commit-date, .commit-hash {
          color: var(--vscode-descriptionForeground);
          font-size: 0.9em;
        }
        .commit-hash {
          cursor: pointer;
        }
        .commit-hash:hover {
          text-decoration: underline;
        }
      </style>
    `;
  }

  setupEventListeners() {
    const hash = this.shadowRoot.querySelector('.commit-hash');
    if (hash) {
      hash.addEventListener('click', (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(this.getAttribute('hash'));
        window.vscode.postMessage({
          command: 'showInfo',
          text: 'Commit hash copied to clipboard',
        });
      });
    }

    const message = this.shadowRoot.querySelector('.commit-message');
    if (message && message.classList.contains('has-body')) {
      message.addEventListener('mouseenter', () => {
        this.dispatchEvent(new CustomEvent('showPopover', {
          detail: { message: this.getAttribute('message') }
        }));
      });

      message.addEventListener('mouseleave', () => {
        this.dispatchEvent(new CustomEvent('hidePopover'));
      });
    }

    if (!this.hasAttribute('is-preview')) {
      this.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('commitSelect', {
          detail: { message: this.getAttribute('message') }
        }));
      });
    }
  }

  render() {
    const isPreview = this.hasAttribute('is-preview');
    const isAmend = this.hasAttribute('is-amend');
    const message = this.getAttribute('message') || '';
    const { summary, description } = this.parseCommitMessage(message);

    this.shadowRoot.innerHTML = `
      ${this.styles}
      <div class="commit-item ${isPreview ? 'preview' : ''} ${isAmend ? 'to-be-amended' : ''}">
        <div class="commit-item-content">
          <div class="commit-indicator ${
            isPreview ? 'preview-indicator' : isAmend ? 'amend-indicator' : ''
          }"></div>
          <div class="commit-message ${description ? 'has-body' : ''}">${summary}</div>
          <span class="commit-date">${this.formatDate(this.getAttribute('date'))}</span>
          <span class="commit-hash" title="Click to copy full hash: ${this.getAttribute('hash')}">${
            this.getAttribute('hash').substring(0, 7)
          }</span>
        </div>
      </div>
    `;
  }

  parseCommitMessage(message) {
    const lines = this.normalizeLineEndings(message).split('\n');
    const summary = lines[0];
    const description = lines.slice(2).join('\n').trim();
    return { summary, description };
  }

  normalizeLineEndings(text) {
    return text.replace(/\r\n|\r|\n/g, '\n');
  }

  formatDate(date) {
    const now = new Date();
    const inputDate = new Date(date);
    const diff = now - inputDate;

    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return inputDate.toLocaleDateString();
  }
}

customElements.define('commit-item', CommitItem);
