import {
    Component,
    Event,
    Prop,
    Element,
    //State,
    //Watch,
    Host,
    EventEmitter,
    h,
    //Method,
} from '@stencil/core';
import { MDCCheckbox } from '@material/checkbox';
import { MDCFormField } from '@material/form-field';

@Component({
    tag: 'kup-checkbox',
    styleUrl: 'kup-checkbox.scss',
    shadow: true,
})
export class KupCheckbox {
    /**
     * Sets the checkbox to be disabled
     */
    @Prop({ mutable: true, reflect: true }) checked: boolean = false;
    /**
     * Sets the checkbox to be disabled
     *
     * Must have reflect into the attribute
     */
    @Prop({ reflect: true }) disabled: boolean = false;
    /**
     * The label to set to the component
     */
    @Prop() label: string = '';
    /**
     * Sets the tabindex of the checkbox
     */
    @Prop() setTabIndex: number = 0;
    /**
     * Sets whether the component uses custom CSS variables or not
     */
    @Prop() custom: boolean = false;

    //---- Internal state ----
    checkbox: HTMLInputElement;

    //---- Public events ----
    /**
     * Fired when the checkbox input is blurred
     */
    @Event({
        eventName: 'kupCheckboxBlur',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupCheckboxBlur: EventEmitter<{
        checked: boolean;
    }>;

    /**
     * Fired when the checkbox input changes its value
     */
    @Event({
        eventName: 'kupCheckboxChange',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupCheckboxChange: EventEmitter<{
        checked: boolean;
    }>;

    /**
     * Fired when the checkbox input receive focus
     */
    @Event({
        eventName: 'kupCheckboxFocus',
        composed: true,
        cancelable: false,
        bubbles: true,
    })
    kupCheckboxFocus: EventEmitter<{
        checked: boolean;
    }>;

    @Element() ketchupCheckboxEl: HTMLElement;

    //---- Methods ----

    componentDidLoad() {
        const root = this.ketchupCheckboxEl.shadowRoot;

        if (root != null) {
            MDCCheckbox.attachTo(root.querySelector('.mdc-checkbox'));
            MDCFormField.attachTo(root.querySelector('.mdc-form-field'));
        } else {
            console.warn(
                `checkbox not properly implemented: ${this.checkbox.outerHTML}`
            );
        }
    }

    //-- Events handlers --

    onCheckboxBlur() {
        this.kupCheckboxBlur.emit({ checked: !!this.checkbox.checked });
    }

    onCheckboxChange(e: UIEvent) {
        const newValue = !!(e.target as HTMLInputElement).checked;
        if (newValue !== this.checked) {
            this.checked = newValue;
            this.kupCheckboxChange.emit({
                checked: newValue,
            });
        }
    }

    onCheckboxFocus() {
        this.kupCheckboxFocus.emit({ checked: !!this.checkbox.checked });
    }

    onHostFocus() {
        if (this.checkbox) {
            this.checkbox.focus();
        }
    }

    //---- Lifecycle hooks ----

    render() {
        let checkboxClass = 'mdc-checkbox ';

        if (this.custom) {
            checkboxClass += ' custom';
        }

        return (
            <Host onFocus={this.onHostFocus.bind(this)}>
                <div class="mdc-form-field">
                    <div class={checkboxClass}>
                        <input
                            type="checkbox"
                            ref={(el) =>
                                (this.checkbox = el as HTMLInputElement)
                            }
                            class="mdc-checkbox__native-control"
                            aria-label={this.label ? this.label : null}
                            checked={this.checked}
                            disabled={this.disabled}
                            tabindex={this.setTabIndex}
                            onBlur={this.onCheckboxBlur.bind(this)}
                            onChange={this.onCheckboxChange.bind(this)}
                            onFocus={this.onCheckboxFocus.bind(this)}
                        />
                        <div class="mdc-checkbox__background">
                            <svg
                                class="mdc-checkbox__checkmark"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    class="mdc-checkbox__checkmark-path"
                                    fill="none"
                                    d="M1.73,12.91 8.1,19.28 22.79,4.59"
                                />
                            </svg>
                            <div class="mdc-checkbox__mixedmark"></div>
                        </div>
                        <div class="mdc-checkbox__ripple"></div>
                    </div>
                </div>
            </Host>
        );
    }
}
