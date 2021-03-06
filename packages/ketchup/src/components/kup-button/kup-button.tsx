import {
    Component,
    Element,
    Event,
    EventEmitter,
    Prop,
    h,
} from '@stencil/core';

@Component({
    tag: 'kup-button',
    styleUrl: 'kup-button.scss',
    shadow: true,
})
export class KupButton {
    @Element() ketchupButtonEl: HTMLElement;

    @Prop() flat = false;
    @Prop() label: string;
    @Prop() buttonStyle: {};
    @Prop() buttonClass: string;
    @Prop() imageSrc: string;
    @Prop() iconClass: string;
    @Prop() fillspace = false;
    @Prop() showtext = true;
    @Prop() showicon = true;
    @Prop() rounded = false;
    @Prop() textmode: string;
    @Prop() transparent = false;
    @Prop() align: string;
    @Prop() tooltip: string;
    @Prop() iconUrl =
        'https://cdn.materialdesignicons.com/4.5.95/css/materialdesignicons.min.css';

    @Event({
        eventName: 'kupButtonClicked',
        composed: true,
        cancelable: true,
        bubbles: true,
    })
    kupButtonClicked: EventEmitter<{
        id: string;
    }>;

    buttonEl: HTMLButtonElement;

    onBtnClickedHandler() {
        this.kupButtonClicked.emit({ id: this.ketchupButtonEl.dataset.id });
    }

    onFocused() {
        this.buttonEl.classList.add('focused');
    }

    onBlurred() {
        this.buttonEl.classList.remove('focused');
    }

    _isHint() {
        return 'Hint' === this.textmode;
    }

    render() {
        let btnLabel = null;
        if (
            (!this._isHint() || (this._isHint() && this.flat)) &&
            this.showtext &&
            this.label
        ) {
            btnLabel = <span class="button-text">{this.label}</span>;
        }

        let image = null;
        if (this.imageSrc) {
            image = <img class="button-image" src={this.imageSrc} />;
        }

        let icon = null;
        if (this.showicon && this.iconClass) {
            icon = <span class={'button-icon ' + this.iconClass} />;
        }

        let btnStyle = this.buttonStyle;

        let btnClass = '';
        if (this.flat) {
            btnClass = 'flat-btn';
        } else {
            if (this.buttonClass) {
                btnClass += this.buttonClass;
            }

            if (this.rounded) {
                btnClass += ' rounded';
            }

            if (this.transparent) {
                btnClass += ' transparent';
            }
        }

        if (this.fillspace) {
            btnClass += ' fillspace';
        }

        if (this.align) {
            if ('right' === this.align) {
                btnClass += ' align-right';
            } else if ('left' === this.align) {
                btnClass += ' align-left';
            }
        }

        btnClass = btnClass.trim();

        let title = '';
        if (this.tooltip) {
            title = this.tooltip;
        } else if (this._isHint()) {
            title = this.label;
        }

        return [
            <link href={this.iconUrl} rel="stylesheet" type="text/css" />,
            <button
                ref={(el) => (this.buttonEl = el)}
                type="button"
                style={btnStyle}
                class={btnClass}
                title={title}
                onClick={() => this.onBtnClickedHandler()}
                onFocus={() => this.onFocused()}
                onBlur={() => this.onBlurred()}
            >
                {image}
                {icon}
                {btnLabel}
            </button>,
        ];
    }
}
