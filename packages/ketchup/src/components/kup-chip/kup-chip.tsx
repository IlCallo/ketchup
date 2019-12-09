import {
    Component,
    Element,
    Event,
    EventEmitter,
    Prop,
    h,
} from '@stencil/core';
import { MDCChipSet } from '@material/chips';

@Component({
    tag: 'kup-chip',
    styleUrl: 'kup-chip.scss',
    shadow: true,
})
export class KupChip {
    @Prop({ reflect: true })
    closable = false;

    @Prop() iconUrl =
        'https://cdn.materialdesignicons.com/4.5.95/css/materialdesignicons.min.css';

    @Prop({ reflect: true })
    disabled = false;

    @Event()
    close: EventEmitter;

    // ---- Listeners ----
    private onCloseClicked() {
        if (!this.disabled) {
            this.close.emit();
        }
    }

    @Element() ketchupChipsEl: HTMLElement;

    componentDidLoad() {
        const root = this.ketchupChipsEl.shadowRoot;

        if (root != null) {
            MDCChipSet.attachTo(root.querySelector('.mdc-chip-set'));
        } else {
            console.warn(`chip not properly implemented`);
        }
    }

    render() {
        let close = null;
        if (this.closable) {
            close = (
                <span role="gridcell">
                    <i
                        tabindex="-1"
                        role="button"
                        class="mdc-chip__icon mdc-chip__icon--trailing mdi mdi-close"
                        onClick={() => this.onCloseClicked()}
                    ></i>
                </span>
            );
        }

        let chipClass = 'mdc-chip';

        if (this.disabled) {
            chipClass += ' disabled';
        }

        return [
            <link href={this.iconUrl} rel="stylesheet" type="text/css" />,
            <div class="mdc-chip-set" role="grid">
                <div
                    role="row"
                    class={chipClass}
                    tabindex="0"
                    aria-disabled={this.disabled ? 'true' : 'false'}
                >
                    <div class="mdc-chip__ripple"></div>
                    <slot />
                    {close}
                </div>
            </div>,
        ];
    }
}
