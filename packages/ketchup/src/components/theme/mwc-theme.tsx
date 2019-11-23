import { Component, Prop, Element, State } from '@stencil/core';
import { setTheme, getTheme } from '../util/mwc-util';
import { h } from '@stencil/core';
@Component({
    tag: 'mwc-theme',
    //styleUrl: 'mwc-theme.scss',
    shadow: false,
})
export class MWCTheme {
    @Element() themeEl: HTMLElement;
    @Prop() theme: object = {};
    @Prop() fonts: Array<string> = [];
    @Prop() icons: Array<string> = [];
    fontsAndIcons: Array<string> = [
        'https://fonts.googleapis.com/css?family=Roboto:300,400,500',
        'https://fonts.googleapis.com/icon?family=Material+Icons',
    ];
    /*
  {
      "primary" : "#8BC34A",
      "primary-light": '#DCEDC8',
      "primary-dark": '#689F38',
      "secondary": '#7C4DFF',
      "secondary-light": '#757575',
      "secondary-dark": '#212121',
      "background": '#BDBDBD'
  };
   */
    constructor() {
        console.log('mwc theme in constructor: ' + JSON.stringify(this.theme));
        setTheme(this.theme);
    }

    componentWillRender() {
        setTheme(this.theme);
    }

    setLinkNode(fontUrl) {
        var linkNode = document.createElement('link');
        linkNode.type = 'text/css';
        linkNode.rel = 'stylesheet';
        linkNode.href = fontUrl;
        document.head.appendChild(linkNode);
    }

    componentWillLoad() {
        const urls = [...this.fonts, ...this.fontsAndIcons, ...this.icons];
        urls.forEach((font) => {
            this.setLinkNode(font);
        });
        //  if(this.theme){
        //   Object.keys(this.theme).forEach((key)=>{
        //       this.themeEl.style.setProperty(`--mdc-theme-${key}`,this.theme[key]);
        //   })
        //  }
        //   console.log(getTheme())
    }

    render() {
        console.log('render theme');
        return <slot />;
    }
}
