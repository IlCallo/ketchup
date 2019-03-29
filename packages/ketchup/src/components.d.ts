/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */


import '@stencil/core';


import {
  ComboItem,
} from './components/ketchup-combo/ketchup-combo-declarations';
import {
  EventEmitter,
} from '@stencil/core';
import {
  KetchupFldChangeEvent,
  KetchupFldSubmitEvent,
} from './components/ketchup-fld/ketchup-fld-declarations';
import {
  KetchupRadioElement,
} from './components/ketchup-radio/ketchup-radio-declarations';
import {
  KetchupTextInputEvent,
} from './components/ketchup-text-input/ketchup-text-input-declarations';


export namespace Components {

  interface KetchupBtn {
    'align': string;
    'borderColor': string;
    'btnStyle': any;
    'buttonClass': string;
    'buttons': any[];
    'columns': number;
    'fillspace': boolean;
    'flat': boolean;
    'horizontal': boolean;
    'iconUrl': string;
    'rounded': boolean;
    'showSelection': boolean;
    'showicon': boolean;
    'showtext': boolean;
    'textmode': string;
    'transparent': boolean;
  }
  interface KetchupBtnAttributes extends StencilHTMLAttributes {
    'align'?: string;
    'borderColor'?: string;
    'btnStyle'?: any;
    'buttonClass'?: string;
    'buttons'?: any[];
    'columns'?: number;
    'fillspace'?: boolean;
    'flat'?: boolean;
    'horizontal'?: boolean;
    'iconUrl'?: string;
    'rounded'?: boolean;
    'showSelection'?: boolean;
    'showicon'?: boolean;
    'showtext'?: boolean;
    'textmode'?: string;
    'transparent'?: boolean;
  }

  interface KetchupButton {
    'align': string;
    'borderColor': string;
    'btnStyle': any;
    'buttonClass': string;
    'fillspace': boolean;
    'flat': boolean;
    'iconClass': string;
    'iconUrl': string;
    'label': string;
    'rounded': boolean;
    'showicon': boolean;
    'showtext': boolean;
    'textmode': string;
    'transparent': boolean;
  }
  interface KetchupButtonAttributes extends StencilHTMLAttributes {
    'align'?: string;
    'borderColor'?: string;
    'btnStyle'?: any;
    'buttonClass'?: string;
    'fillspace'?: boolean;
    'flat'?: boolean;
    'iconClass'?: string;
    'iconUrl'?: string;
    'label'?: string;
    'onKetchupButtonClicked'?: (event: CustomEvent<{
      id: string;
    }>) => void;
    'rounded'?: boolean;
    'showicon'?: boolean;
    'showtext'?: boolean;
    'textmode'?: string;
    'transparent'?: boolean;
  }

  interface KetchupCombo {
    /**
    * Programmatically close the combo box
    */
    'closeCombo': () => void;
    /**
    * Chooses which field of an item object should be used to create the list and be filtered.
    */
    'displayedField': string;
    /**
    * Allows to pass an initial selected item for the combobox
    */
    'initialValue': any;
    /**
    * Marks the field as clearable, allowing an icon to delete its content
    */
    'isClearable': boolean;
    /**
    * Items which can be selected
    */
    'items': ComboItem[];
    /**
    * Label to describe the radio group
    */
    'label': string;
    /**
    * Programmatically opens the combo box
    */
    'openCombo': () => void;
    /**
    * Chooses which field of an item object should be used to create the list and be filtered.
    */
    'valueField': string;
  }
  interface KetchupComboAttributes extends StencilHTMLAttributes {
    /**
    * Chooses which field of an item object should be used to create the list and be filtered.
    */
    'displayedField'?: string;
    /**
    * Allows to pass an initial selected item for the combobox
    */
    'initialValue'?: any;
    /**
    * Marks the field as clearable, allowing an icon to delete its content
    */
    'isClearable'?: boolean;
    /**
    * Items which can be selected
    */
    'items'?: ComboItem[];
    /**
    * Label to describe the radio group
    */
    'label'?: string;
    'onKetchupComboSelected'?: (event: CustomEvent<{
      value: object;
    }>) => void;
    /**
    * Chooses which field of an item object should be used to create the list and be filtered.
    */
    'valueField'?: string;
  }

  interface KetchupFld {
    /**
    * Data the FLD must parse to fully be configured. It must be either an Object or a JSON parsable string
    */
    'config': string | object;
    /**
    * Effective data to pass to the component
    */
    'data': any;
    /**
    * Provides an interface to get the current value programmatically
    */
    'getCurrentValue': () => Promise<string | object>;
  }
  interface KetchupFldAttributes extends StencilHTMLAttributes {
    /**
    * Data the FLD must parse to fully be configured. It must be either an Object or a JSON parsable string
    */
    'config'?: string | object;
    /**
    * Effective data to pass to the component
    */
    'data'?: any;
    /**
    * Launched when the value of the current FLD changes.
    */
    'onKetchupFldChanged'?: (event: CustomEvent<KetchupFldChangeEvent>) => void;
    /**
    * Launched when the FLD values are confirmed and a submit event is triggered.
    */
    'onKetchupFldSubmit'?: (event: CustomEvent<KetchupFldSubmitEvent>) => void;
  }

  interface KetchupRadio {
    /**
    * Direction in which the radio elements must be placed
    */
    'direction': string;
    /**
    * Chooses which field of an item object should be used to create the list and be filtered.
    */
    'displayedField': string;
    /**
    * Radio elements to display
    */
    'items': KetchupRadioElement[];
    /**
    * Label to describe the radio group
    */
    'label': string;
    /**
    * Radio elements value
    */
    'radioName': string;
    /**
    * Chooses which field of an item object should be used to create the list and be filtered.
    */
    'valueField': string;
  }
  interface KetchupRadioAttributes extends StencilHTMLAttributes {
    /**
    * Direction in which the radio elements must be placed
    */
    'direction'?: string;
    /**
    * Chooses which field of an item object should be used to create the list and be filtered.
    */
    'displayedField'?: string;
    /**
    * Radio elements to display
    */
    'items'?: KetchupRadioElement[];
    /**
    * Label to describe the radio group
    */
    'label'?: string;
    /**
    * When currently selected radio button has been changed.
    */
    'onKetchupRadioChanged'?: (event: CustomEvent<{
      value: KetchupRadioElement;
      oldValue: KetchupRadioElement;
    }>) => void;
    /**
    * Radio elements value
    */
    'radioName'?: string;
    /**
    * Chooses which field of an item object should be used to create the list and be filtered.
    */
    'valueField'?: string;
  }

  interface KetchupTextInput {
    /**
    * Marks the field as clearable, allowing an icon to delete its content
    */
    'initialValue': string;
    /**
    * Marks the field as clearable, allowing an icon to delete its content
    */
    'isClearable': boolean;
    /**
    * Label to describe the radio group
    */
    'label': string;
    /**
    * The max length of the text field. Default value copied from here: https://www.w3schools.com/tags/att_input_maxlength.asp
    */
    'maxLength': number;
    /**
    * Triggers the focus event on the input text
    */
    'triggerFocus': () => void;
  }
  interface KetchupTextInputAttributes extends StencilHTMLAttributes {
    /**
    * Marks the field as clearable, allowing an icon to delete its content
    */
    'initialValue'?: string;
    /**
    * Marks the field as clearable, allowing an icon to delete its content
    */
    'isClearable'?: boolean;
    /**
    * Label to describe the radio group
    */
    'label'?: string;
    /**
    * The max length of the text field. Default value copied from here: https://www.w3schools.com/tags/att_input_maxlength.asp
    */
    'maxLength'?: number;
    /**
    * When text field loses focus (blur)
    */
    'onKetchupTextInputBlurred'?: (event: CustomEvent<KetchupTextInputEvent>) => void;
    /**
    * When the text input gains focus
    */
    'onKetchupTextInputFocused'?: (event: CustomEvent<KetchupTextInputEvent>) => void;
    /**
    * When a keydown enter event occurs it generates
    */
    'onKetchupTextInputSubmit'?: (event: CustomEvent<{
      value: string;
    }>) => void;
    /**
    * When the input text value gets updated
    */
    'onKetchupTextInputUpdated'?: (event: CustomEvent<KetchupTextInputEvent>) => void;
  }

  interface MyComponent {
    /**
    * The first name
    */
    'first': string;
    /**
    * The last name
    */
    'last': string;
    /**
    * The middle name
    */
    'middle': string;
  }
  interface MyComponentAttributes extends StencilHTMLAttributes {
    /**
    * The first name
    */
    'first'?: string;
    /**
    * The last name
    */
    'last'?: string;
    /**
    * The middle name
    */
    'middle'?: string;
  }
}

declare global {
  interface StencilElementInterfaces {
    'KetchupBtn': Components.KetchupBtn;
    'KetchupButton': Components.KetchupButton;
    'KetchupCombo': Components.KetchupCombo;
    'KetchupFld': Components.KetchupFld;
    'KetchupRadio': Components.KetchupRadio;
    'KetchupTextInput': Components.KetchupTextInput;
    'MyComponent': Components.MyComponent;
  }

  interface StencilIntrinsicElements {
    'ketchup-btn': Components.KetchupBtnAttributes;
    'ketchup-button': Components.KetchupButtonAttributes;
    'ketchup-combo': Components.KetchupComboAttributes;
    'ketchup-fld': Components.KetchupFldAttributes;
    'ketchup-radio': Components.KetchupRadioAttributes;
    'ketchup-text-input': Components.KetchupTextInputAttributes;
    'my-component': Components.MyComponentAttributes;
  }


  interface HTMLKetchupBtnElement extends Components.KetchupBtn, HTMLStencilElement {}
  var HTMLKetchupBtnElement: {
    prototype: HTMLKetchupBtnElement;
    new (): HTMLKetchupBtnElement;
  };

  interface HTMLKetchupButtonElement extends Components.KetchupButton, HTMLStencilElement {}
  var HTMLKetchupButtonElement: {
    prototype: HTMLKetchupButtonElement;
    new (): HTMLKetchupButtonElement;
  };

  interface HTMLKetchupComboElement extends Components.KetchupCombo, HTMLStencilElement {}
  var HTMLKetchupComboElement: {
    prototype: HTMLKetchupComboElement;
    new (): HTMLKetchupComboElement;
  };

  interface HTMLKetchupFldElement extends Components.KetchupFld, HTMLStencilElement {}
  var HTMLKetchupFldElement: {
    prototype: HTMLKetchupFldElement;
    new (): HTMLKetchupFldElement;
  };

  interface HTMLKetchupRadioElement extends Components.KetchupRadio, HTMLStencilElement {}
  var HTMLKetchupRadioElement: {
    prototype: HTMLKetchupRadioElement;
    new (): HTMLKetchupRadioElement;
  };

  interface HTMLKetchupTextInputElement extends Components.KetchupTextInput, HTMLStencilElement {}
  var HTMLKetchupTextInputElement: {
    prototype: HTMLKetchupTextInputElement;
    new (): HTMLKetchupTextInputElement;
  };

  interface HTMLMyComponentElement extends Components.MyComponent, HTMLStencilElement {}
  var HTMLMyComponentElement: {
    prototype: HTMLMyComponentElement;
    new (): HTMLMyComponentElement;
  };

  interface HTMLElementTagNameMap {
    'ketchup-btn': HTMLKetchupBtnElement
    'ketchup-button': HTMLKetchupButtonElement
    'ketchup-combo': HTMLKetchupComboElement
    'ketchup-fld': HTMLKetchupFldElement
    'ketchup-radio': HTMLKetchupRadioElement
    'ketchup-text-input': HTMLKetchupTextInputElement
    'my-component': HTMLMyComponentElement
  }

  interface ElementTagNameMap {
    'ketchup-btn': HTMLKetchupBtnElement;
    'ketchup-button': HTMLKetchupButtonElement;
    'ketchup-combo': HTMLKetchupComboElement;
    'ketchup-fld': HTMLKetchupFldElement;
    'ketchup-radio': HTMLKetchupRadioElement;
    'ketchup-text-input': HTMLKetchupTextInputElement;
    'my-component': HTMLMyComponentElement;
  }


  export namespace JSX {
    export interface Element {}
    export interface IntrinsicElements extends StencilIntrinsicElements {
      [tagName: string]: any;
    }
  }
  export interface HTMLAttributes extends StencilHTMLAttributes {}

}