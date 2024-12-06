export class CommitList extends HTMLElement {
  #commits = [];
  #isAmendMode = false;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['is-amend-mode', 'css-uri', 'item-css-uri'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'is-amend-mode') {
      this.#isAmendMode = newValue !== null;
      this.render();
    } else if (name === 'css-uri' && newValue && this.shadowRoot) {
      const styleSheet = this.shadowRoot.querySelector('link');
      if (styleSheet) {
        styleSheet.href = newValue;
      }
    }
  }

  setCommits(commits = []) {
    this.#commits = commits.map(commit => ({
      ...commit,
      message: commit.message || '',
      date: commit.date || new Date().toISOString()
    }));
    this.render();
  }

  addPreview(message = '', date = null) {
    const previewCommit = {
      message: message || '',
      date: date || new Date().toISOString(),
      preview: true,
    };

    this.#commits = [previewCommit, ...this.#commits];
    this.render();
  }

  clearPreview() {
    this.#commits = this.#commits.filter(commit => !commit.preview);
    this.render();
  }

  render() {
    const styleSheet = document.createElement('link');
    styleSheet.rel = 'stylesheet';
    styleSheet.href = this.getAttribute('css-uri') || './components/CommitList.css';

    const commitItems = this.#commits.map((commit, index) => {
      const isToBeAmended = this.#isAmendMode && index === 0;
      const message = commit.message || '';
      const date = commit.date || '';
      
      return `
        <commit-item
          message="${message.replace(/"/g, '&quot;')}"
          date="${date}"
          css-uri="${this.getAttribute('item-css-uri') || ''}"
          ${commit.preview ? 'preview' : ''}
          ${isToBeAmended ? 'to-be-amended' : ''}
        ></commit-item>
      `;
    }).join('');

    this.shadowRoot.innerHTML = `
      <div class="commit-list-container">
        <h3>Recent Commits</h3>
        <div class="commit-items">
          ${commitItems.length ? commitItems : '<div class="empty-state">No commits to show</div>'}
        </div>
      </div>
    `;

    this.shadowRoot.prepend(styleSheet);

    // Add event listeners after rendering
    this.shadowRoot.querySelectorAll('commit-item').forEach((item, index) => {
      item.addEventListener('click', (e) => {
        try {
          const commit = this.#commits[index];
          if (!commit?.preview && e.detail?.message) {
            this.dispatchEvent(
              new CustomEvent('commitSelect', { 
                detail: { message: e.detail.message } 
              })
            );
          }
        } catch (error) {
          console.error('Error handling commit item click:', error);
        }
      });
    });
  }
}

customElements.define('commit-list', CommitList);
