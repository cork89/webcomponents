import { CustomSliderEventDetail } from "./global"

export class CustomSlider extends HTMLElement {
    private slider!: HTMLInputElement
    private valueDisplay!: HTMLDivElement
    private marksContainer!: HTMLDivElement
    shadowRoot!: ShadowRoot

    constructor() {
        super();
        this.shadowRoot = this.attachShadow({
            mode: "open",
        });
    }

    static get observedAttributes(): string[] {
        return ["min", "max", "value", "step", "label", "unit", "mark-interval", "mark-label-interval"];
    }

    connectedCallback(): void {
        this.render();

        this.slider = this.shadowRoot.querySelector("input[type='range']",) as HTMLInputElement;
        this.valueDisplay = this.shadowRoot.querySelector(".value-display",) as HTMLDivElement;
        this.marksContainer = this.shadowRoot.querySelector(".marks-container") as HTMLDivElement

        this.slider.addEventListener("input", this._handleSliderInput.bind(this));
        this._updateDisplay();
        this._createMarks()
    }

    attributeChangedCallback(
        name: string,
        oldValue: string | null,
        newValue: string | null,
    ): void {
        if (this.slider && this.valueDisplay && oldValue !== newValue) {
            if (name === "label") {
                (this.shadowRoot.querySelector("label") as HTMLLabelElement).textContent =
                    newValue;
            } else if (["min", "max", "step", "value"].includes(name)) {
                (this.slider as any)[name] = newValue;
                this._updateDisplay();
            } else if (name === "unit") {
                this._updateDisplay();
            } else if (["mark-interval", "mark-label-interval"].includes(name)) {
                this._createMarks();
            }
        }
    }

    private _handleSliderInput(): void {
        this._updateDisplay();
        this.dispatchEvent(
            new CustomEvent<CustomSliderEventDetail>("slider-change", {
                detail: {
                    value: this.slider.value,
                    id: this.id,
                },
                bubbles: true,
                composed: true,
            }),
        );
    }

    private _updateDisplay(): void {
        const value = this.slider.value;
        const unit = this.getAttribute("unit") || "";
        let formattedValue: string;

        if (unit === "$") {
            formattedValue = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(Number(value));
        } else {
            formattedValue = `${value}${unit}`;
        }

        this.valueDisplay.textContent = formattedValue;
    }

    private _createMarks(): void {
        if (!this.marksContainer) return;

        // Clear existing marks
        this.marksContainer.innerHTML = "";

        const markInterval = this.getAttribute("mark-interval");
        const markLabelInterval = this.getAttribute("mark-label-interval");

        // Only show marks if both attributes are present
        if (!markInterval || !markLabelInterval) return;

        const min = Number(this.getAttribute("min") || "0");
        const max = Number(this.getAttribute("max") || "100");
        const interval = Number(markInterval);
        const labelInterval = Number(markLabelInterval);

        const totalRange = max - min;

        for (let value = min; value <= max; value += interval) {
            const position = ((value - min) / totalRange) * 100;

            // Create the mark line
            const mark = document.createElement("div");
            mark.className = "mark";
            mark.style.left = position + "%";
            this.marksContainer.appendChild(mark);

            // Create the label if it's a label interval
            if (value % labelInterval === 0) {
                const label = document.createElement("div");
                label.className = "mark-label";
                label.style.left = position + "%";
                label.textContent = `${value}`;
                this.marksContainer.appendChild(label);
            }
        }
    }

    private render(): void {
        const label = this.getAttribute("label") || "Slider";
        const min = this.getAttribute("min") || "0";
        const max = this.getAttribute("max") || "100";
        const initialValue = this.getAttribute("value") || "50";
        const step = this.getAttribute("step") || "1";
        const id = this.id;

        this.shadowRoot.innerHTML = `
      <style>
        :host {
            display: block;
            margin-bottom: var(--spacing-xxl);
        }
        .input-group {
            margin-bottom: var(--spacing-xxl);
        }
        label {
            display: block;
            margin-bottom: var(--spacing-sm);
            font-weight: var(--font-weight-bold);
            color: var(--text-secondary);
        }
        .slider-container {
            position: relative;
            margin-bottom: var(--spacing-md);
        }
        .marks-container {
            position: relative;
            height: var(--slider-marks-height);
            margin-bottom: var(--spacing-xs);
        }
        .mark {
            position: absolute;
            width: var(--slider-mark-width);
            height: var(--slider-mark-height);
            background-color: var(--border-light);
            top: 0;
        }
        .mark-label {
            position: absolute;
            font-size: var(--font-size-sm);
            color: var(--text-muted-readable);
            top: var(--spacing-md);
            transform: translateX(-50%);
            white-space: nowrap;
        }
        input[type="range"] {
            width: 100%;
            height: var(--slider-height);
            border-radius: var(--border-radius);
            background: var(--border-color);
            outline: none;
            -webkit-appearance: none;
            margin: 0;
        }
        
        input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: var(--slider-thumb-size);
            height: var(--slider-thumb-size);
            border-radius: 50%;
            background: var(--success-color);
            cursor: pointer;
        }
            
        input[type="range"]::-moz-range-thumb {
            width: var(--slider-thumb-size);
            height: var(--slider-thumb-size);
            border-radius: 50%;
            background: var(--success-color);
            cursor: pointer;
            border: none;
        }
        
        input[type="range"]:focus {
            outline: none;
            background: rgba(76, 175, 80, 0.1);
            box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.3);
        }

        input[type="range"]:focus::-webkit-slider-thumb {
            box-shadow: var(--slider-focus-shadow);
            transform: scale(1.1);
        }

        input[type="range"]:focus::-moz-range-thumb {
            box-shadow: var(--slider-focus-shadow);
            transform: scale(1.1);
        }

        .value-display {
            text-align: center;
            font-size: var(--font-size-lg);
            font-weight: var(--font-weight-bold);
            color: var(--text-primary);
            margin-top: var(--spacing-xs);
        }
      </style>
      <div class="input-group">
          <label for="${id}">${label}</label>
          <div class="slider-container">
              <div class="slider-wrapper">
                  <div class="marks-container"></div>
                  <input type="range" id="${id}" min="${min}" max="${max}" value="${initialValue}" step="${step}" />
              </div>
          </div>
          <div class="value-display"></div>
      </div>
    `;
    }
}