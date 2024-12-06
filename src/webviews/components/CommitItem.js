export class CommitItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['message', 'date', 'preview', 'to-be-amended', 'css-uri'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'css-uri' && newValue && this.shadowRoot) {
      const styleSheet = this.shadowRoot.querySelector('link');
      if (styleSheet) {
        styleSheet.href = newValue;
      }
    } else if (oldValue !== newValue) {
      this.render();
    }
  }

  formatDate(dateString) {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);

      if (diffInSeconds < 60) {
        return 'just now';
      }

      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`;
      }

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        return `${diffInHours}h ago`;
      }

      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 30) {
        return `${diffInDays}d ago`;
      }

      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return date.toLocaleDateString(undefined, options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }

  parseCommitMessage(message = '') {
    if (!message) {
      return { summary: '', description: '' };
    }

    try {
      const normalizedMessage = message.replace(/\r\n|\r|\n/g, '\n');
      const [firstLine, ...rest] = normalizedMessage.split('\n\n');
      return {
        summary: firstLine || '',
        description: rest.join('\n\n')
      };
    } catch (error) {
      console.error('Error parsing commit message:', error);
      return { summary: message, description: '' };
    }
  }

  render() {
    const styleSheet = document.createElement('link');
    styleSheet.rel = 'stylesheet';
    styleSheet.href = this.getAttribute('css-uri') || '';

    const message = this.getAttribute('message') || '';
    const date = this.getAttribute('date');
    const { summary, description } = this.parseCommitMessage(message);
    const formattedDate = this.formatDate(date);
    const isPreview = this.hasAttribute('preview');
    const isToBeAmended = this.hasAttribute('to-be-amended');

    const template = document.createElement('template');
    template.innerHTML = `
      <div class="commit-item ${isPreview ? 'preview' : ''} ${isToBeAmended ? 'to-be-amended' : ''}">
        <div class="commit-summary">${summary}</div>
        ${description ? `<div class="commit-description">${description}</div>` : ''}
        ${formattedDate ? `<div class="commit-date">${formattedDate}</div>` : ''}
      </div>
    `;

    // Clear existing content and add new content
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(styleSheet);
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // Add click event listener
    const commitItem = this.shadowRoot.querySelector('.commit-item');
    if (commitItem) {
      commitItem.addEventListener('click', () => {
        this.dispatchEvent(
          new CustomEvent('commitSelect', {
            bubbles: true,
            composed: true,
            detail: {
              message,
              date,
            },
          })
        );
      });
    }
  }
}

customElements.define('commit-item', CommitItem);
