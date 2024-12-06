export class CommitInput extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() {
    return ["css-uri"];
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "css-uri" && newValue && this.shadowRoot) {
      const styleSheet = this.shadowRoot.querySelector("link");
      if (styleSheet) {
        styleSheet.href = newValue;
      }
    }
  }

  setupEventListeners() {
    const summaryInput = this.shadowRoot.querySelector("#summary");
    const descriptionInput = this.shadowRoot.querySelector("#description");
    const summaryCharCount = this.shadowRoot.querySelector("#summary-count");
    const descriptionCharCount =
      this.shadowRoot.querySelector("#description-count");

    const updateCharCount = (input, countElement) => {
      const count = input.value.length;
      countElement.textContent = `${count} characters`;

      if (count > 72) {
        countElement.classList.add("error");
        countElement.classList.remove("warning");
      } else if (count > 50) {
        countElement.classList.add("warning");
        countElement.classList.remove("error");
      } else {
        countElement.classList.remove("warning", "error");
      }
    };

    const handleInput = (e) => {
      const input = e.target;
      const countElement =
        input.id === "summary" ? summaryCharCount : descriptionCharCount;
      updateCharCount(input, countElement);

      this.dispatchEvent(
        new CustomEvent("input", {
          detail: {
            summary: summaryInput.value,
            description: descriptionInput.value,
          },
        })
      );
    };

    summaryInput.addEventListener("input", handleInput);
    descriptionInput.addEventListener("input", handleInput);

    // Initialize character counts
    updateCharCount(summaryInput, summaryCharCount);
    updateCharCount(descriptionInput, descriptionCharCount);
  }

  setValue(summary, description = "") {
    const summaryInput = this.shadowRoot.querySelector("#summary");
    const descriptionInput = this.shadowRoot.querySelector("#description");
    const summaryCharCount = this.shadowRoot.querySelector("#summary-count");
    const descriptionCharCount =
      this.shadowRoot.querySelector("#description-count");

    if (summaryInput && descriptionInput) {
      summaryInput.value = summary;
      descriptionInput.value = description;

      // Update character counts
      const updateCharCount = (input, countElement) => {
        const count = input.value.length;
        countElement.textContent = `${count} characters`;
        countElement.classList.toggle("warning", count > 50);
        countElement.classList.toggle("error", count > 72);
      };

      updateCharCount(summaryInput, summaryCharCount);
      updateCharCount(descriptionInput, descriptionCharCount);

      this.dispatchEvent(
        new CustomEvent("input", {
          detail: { summary, description },
        })
      );
    }
  }

  getValue() {
    const summaryInput = this.shadowRoot.querySelector("#summary");
    const descriptionInput = this.shadowRoot.querySelector("#description");

    return {
      summary: summaryInput.value,
      description: descriptionInput.value,
    };
  }

  render() {
    const styleSheet = document.createElement("link");
    styleSheet.rel = "stylesheet";
    styleSheet.href = this.getAttribute("css-uri") || "";

    this.shadowRoot.innerHTML = `
      <div class="input-section">
        <div class="input-group">
          <div class="input-label">
            <label for="summary">Summary</label>
            <span class="shortcut">⌘ + Enter to commit</span>
          </div>
          <input 
            type="text" 
            id="summary" 
            placeholder="Write a concise summary of your changes" 
            maxlength="100"
          />
          <div id="summary-count" class="char-count">0 characters</div>
        </div>
        <div class="input-group">
          <div class="input-label">
            <label for="description">Description</label>
          </div>
          <textarea 
            id="description" 
            placeholder="Add a more detailed description of your changes (optional)"
          ></textarea>
          <div id="description-count" class="char-count">0 characters</div>
        </div>
      </div>
    `;

    this.shadowRoot.prepend(styleSheet);
  }
}

customElements.define("commit-input", CommitInput);
