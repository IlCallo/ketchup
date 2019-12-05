import {
    Component,
    Element,
    Event,
    EventEmitter,
    Prop,
    h,
} from '@stencil/core';
import { MDCRipple } from '@material/ripple/index';

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
    @Prop() align: string = 'left';
    @Prop() tooltip: string;
    @Prop() disabled = false;
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

    onBtnClickedHandler() {
        this.kupButtonClicked.emit({ id: this.ketchupButtonEl.dataset.id });
    }

    componentDidLoad() {
        MDCRipple.attachTo(
            this.ketchupButtonEl.shadowRoot.querySelector('button')
        );
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
            icon = (
                <span
                    class={'material-icons mdc-button__icon ' + this.iconClass}
                />
            );
        }

        let btnStyle = this.buttonStyle;

        let btnClass = 'mdc-button ' + this.buttonClass;

        if (this.transparent) {
            btnClass += ' mdc-button--outlined';
        } else if (!this.flat) {
            btnClass += ' mdc-button--raised';
        }

        if (this.rounded) {
            btnClass += ' button-shaped';
        }

        if (this.fillspace) {
            btnClass += ' fillspace';
        }

        btnClass = btnClass.trim();

        let title = '';
        if (this.tooltip) {
            title = this.tooltip;
        } else if (this._isHint()) {
            title = this.label;
        }

        let markup1: string;
        let markup2: string;

        if (this.align) {
            if ('right' === this.align) {
                markup1 = btnLabel;
                markup2 = icon;
                btnClass += ' trailing-right';
            } else {
                markup1 = icon;
                markup2 = btnLabel;
                btnClass += ' trailing-left';
            }
        }

        return [
            <link href={this.iconUrl} rel="stylesheet" type="text/css" />,
            <button
                type="button"
                style={btnStyle}
                class={btnClass}
                title={title}
                disabled={this.disabled}
                onClick={() => this.onBtnClickedHandler()}
            >
                <div class="mdc-button__ripple"></div>
                {image}
                {markup1}
                {markup2}
            </button>,
        ];
    }
}
