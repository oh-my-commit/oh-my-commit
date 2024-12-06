export class ActionButtons extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['disabled', 'css-uri'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'css-uri' && newValue && this.shadowRoot) {
      const styleSheet = this.shadowRoot.querySelector('link');
      if (styleSheet) {
        styleSheet.href = newValue;
      }
    } else if (name === 'disabled') {
      const commitButton = this.shadowRoot?.querySelector('.commit-button');
      if (commitButton) {
        commitButton.disabled = newValue !== null;
      }
    }
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  setupEventListeners() {
    const commitButton = this.shadowRoot.querySelector('.commit-button');
    const cancelButton = this.shadowRoot.querySelector('.cancel-button');

    commitButton?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('commit'));
    });

    cancelButton?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('cancel'));
    });
  }

  setDisabled(disabled) {
    if (disabled) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }

  render() {
    const styleSheet = document.createElement('link');
    styleSheet.rel = 'stylesheet';
    styleSheet.href = this.getAttribute('css-uri') || '';

    this.shadowRoot.innerHTML = `
      <div class="button-group">
        <button class="commit-button" ${this.hasAttribute('disabled') ? 'disabled' : ''}>
          Commit
        </button>
        <button class="cancel-button">
          Cancel
        </button>
      </div>
    `;

    this.shadowRoot.prepend(styleSheet);
  }
}

customElements.define('action-buttons', ActionButtons);
