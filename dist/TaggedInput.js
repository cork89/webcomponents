export class TagInput extends HTMLElement {
    currentTags = [];
    TAG_CHAR_LIMIT = 20;
    MAX_TAGS = 5;
    tagInput;
    tagFormInput;
    tagContainer;
    saveButton;
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        if (this.shadowRoot) {
            this.shadowRoot.innerHTML = `
          <style>
            .tag {
              border: 1px solid rgba(0, 0, 0, 0.1);
              border-radius: 12px;
              display: inline-block;
              padding: 3px 8px;
              background-color: #7a7a7a;
              color: white;
              font-size: 0.8em;
              margin-right: 4px;
            }
  
            .tag-container {
              display: flex;
              flex-wrap: wrap;
              align-items: center;
              border: 1px solid #ccc;
              padding: 5px;
              border-radius: 5px;
              width: 600px;
            }
  
            #tag-input {
              border: none;
              outline: none;
              flex-grow: 1;
              padding: 5px;
              background-color: var(--color-create-input, #fff);
            }
  
            #tag-input:focus {
              outline: solid rgb(91, 172, 199);
              border-radius: 3px;
            }
  
            .tag-remove {
              margin-left: 5px;
              cursor: pointer;
            }
  
            button {
              margin-top: 10px;
              padding: 5px 10px;
            }
          </style>
          <div id="tag-form">
            <div class="tag-container">
              <input type="text" id="tag-input" placeholder="Enter tag (20 characters max)">
            </div>
            <input type="hidden" id="tag-form-input" name="tag-form-input" value="null" />
            <button type="submit">Save</button>
          </div>
        `;
        }
    }
    connectedCallback() {
        if (!this.shadowRoot)
            return;
        const tagInputElement = this.shadowRoot.getElementById("tag-input");
        if (!(tagInputElement instanceof HTMLInputElement)) {
            throw new Error("tag-input element is missing or not an input");
        }
        this.tagInput = tagInputElement;
        const tagFormInputElement = this.shadowRoot.getElementById("tag-form-input");
        if (!(tagFormInputElement instanceof HTMLInputElement)) {
            throw new Error("tag-form-input element is missing or not an input");
        }
        this.tagFormInput = tagFormInputElement;
        const tagContainerElement = this.shadowRoot.querySelector(".tag-container");
        if (!(tagContainerElement instanceof HTMLElement)) {
            throw new Error("tag-container element is missing or not an HTMLElement");
        }
        this.tagContainer = tagContainerElement;
        const saveButtonElement = this.shadowRoot.querySelector("button");
        if (!(saveButtonElement instanceof HTMLButtonElement)) {
            throw new Error("Save button is missing or not a button element");
        }
        this.saveButton = saveButtonElement;
        // Bind event listeners
        this.tagInput.addEventListener("keydown", this.onKeyDown.bind(this));
        this.saveButton.addEventListener("click", this.onSave.bind(this));
    }
    isTagInputValid() {
        const input = this.tagInput.value;
        return input.length <= this.TAG_CHAR_LIMIT;
    }
    currentTagsToString() {
        return this.currentTags
            .map((tag) => tag.textContent.trim().slice(0, -1))
            .join(",");
    }
    createTag(text, silent = false) {
        const tag = document.createElement("div");
        tag.className = "tag";
        tag.innerHTML = `${text}<span class="tag-remove">&times;</span>`;
        this.tagContainer.insertBefore(tag, this.tagInput);
        this.currentTags.push(tag);
        const removeButton = tag.querySelector(".tag-remove");
        if (removeButton) {
            removeButton.addEventListener("click", () => {
                this.removeTag(tag);
            });
        }
        if (!silent) {
            this.tagFormInput.value = this.currentTagsToString();
        }
    }
    removeTag(tag) {
        this.currentTags = this.currentTags.filter((t) => t !== tag);
        tag.remove();
        this.tagInput.focus();
        this.tagFormInput.value = this.currentTagsToString();
    }
    onKeyDown(event) {
        if (event.key === "," || event.key === "Enter") {
            event.preventDefault();
            if (!this.isTagInputValid()) {
                return;
            }
            const input = this.tagInput.value.trim();
            if (input && this.currentTags.length < this.MAX_TAGS) {
                this.createTag(input, false);
                this.tagInput.value = "";
            }
        }
        else if ((event.key === "Backspace" || event.key === "Delete") &&
            this.tagInput.value.trim() === "") {
            event.preventDefault();
            const mostRecentTag = this.currentTags[this.currentTags.length - 1];
            if (mostRecentTag) {
                this.removeTag(mostRecentTag);
            }
        }
    }
    onSave(event) {
        event.preventDefault();
        const tagsData = this.currentTagsToString();
        this.dispatchEvent(new CustomEvent("tags-saved", {
            detail: { tags: tagsData },
        }));
        console.log("Saved Tags:", tagsData);
    }
}
