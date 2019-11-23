import { h } from '@stencil/core';
import { Component, Prop, Element } from '@stencil/core';

import ButtonStyle, { rippleColors } from './mwc-button-style';
import tmripple from '../util/ripple';
import { colorType, buttonColor } from './mwc-button-types';
import { setTheme } from '../util/mwc-util';
import { getTheme } from '../util/mwc-util';

@Component({
    tag: 'mwc-button',
    shadow: false,
})
export class MWCButton {
    @Prop() icon: string;
    @Prop() raised: boolean = false;
    @Prop() unelevated: boolean = false;
    @Prop() stroked: boolean = false;
    @Prop() dense: boolean = false;
    @Prop() compact: boolean = false;
    @Prop() color: colorType = 'default';
    @Prop() backgroundcolor: string = '#ff0000';
    @Prop() disabled: boolean = false;
    @Prop() ripple: boolean = true;
    @Prop() fab: boolean = false;
    @Prop() mini: boolean = false;
    @Prop() href: string;
    @Prop() theme: object = {};
    @Prop() cstyle: object = {};
    buttonRipple: any;
    mwcButton: any;

    @Element() btnEl: HTMLElement;
    classes: any;

    componentWillLoad() {
        console.log('button will render');
        const buttonStyle = new ButtonStyle();
        buttonStyle.setup(this.cstyle);
        //this.btnEl.disabled = this.disabled;

        /*  Object.getOwnPropertyNames(this).forEach((key) => {
          console.log(typeof this[key])
      }) */
        this.btnEl.className = buttonStyle.getClassName(this.getClassNames());
    }
    getClassNames(): Array<string> {
        let classNames: Array<string> = ['root'];
        if (this.disabled) {
            classNames.push('disabled');
        }
        if (this.raised) {
            classNames.push('raised');
            if (this.color !== 'default') {
                classNames.push(`raised${buttonColor[this.color]}`);
            }
        }
        if (!this.raised && !this.stroked && !this.unelevated) {
            if (this.color !== 'default') {
                classNames.push(`flat${buttonColor[this.color]}`);
            }
        }
        if (this.dense) {
            classNames.push('dense');
        }
        if (this.fab) {
            classNames.push('fab');
        }
        if (this.mini) {
            classNames.push('mini');
        }
        return classNames;
    }
    componentDidLoad() {
        if (this.ripple) {
            const rippleColor =
                this.raised &&
                (this.color === 'primary' || this.color === 'secondary')
                    ? rippleColors.white
                    : rippleColors[this.color];
            tmripple.attachToSelectors({
                selectors: this.btnEl,
                color: rippleColor,
                eventListener: 'mousedown',
            });
        }
    }

    render() {
        console.log('render button');
        return (
            <span onClick={(event: UIEvent) => this.onBtnClicked(event)}>
                <slot />
            </span>
        );
    }

    onBtnClicked(event: UIEvent) {
        console.log('clicked');
    }
}
