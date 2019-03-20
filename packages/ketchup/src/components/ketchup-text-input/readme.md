# ketchup-text-input



<!-- Auto Generated Below -->


## Properties

| Property       | Attribute       | Description                                                                                                              | Type      | Default  |
| -------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------ | --------- | -------- |
| `initialValue` | `initial-value` | Marks the field as clearable, allowing an icon to delete its content                                                     | `string`  | `''`     |
| `isClearable`  | `is-clearable`  | Marks the field as clearable, allowing an icon to delete its content                                                     | `boolean` | `false`  |
| `label`        | `label`         | Label to describe the radio group                                                                                        | `string`  | `''`     |
| `maxLength`    | `max-length`    | The max length of the text field. Default value copied from here: https://www.w3schools.com/tags/att_input_maxlength.asp | `number`  | `524288` |


## Events

| Event                     | Description                            | Type                |
| ------------------------- | -------------------------------------- | ------------------- |
| `ketchupTextInputBlurred` | When text field loses focus (blur)     | `CustomEvent<void>` |
| `ketchupTextInputFocused` | When the text input gains focus        | `CustomEvent<void>` |
| `ketchupTextInputUpdated` | When the input text value gets updated | `CustomEvent<void>` |


## Methods

### `triggerFocus() => void`

Triggers the focus event on the input text

#### Returns

Type: `void`




## CSS Custom Properties

| Name                                                          | Description                                     |
| ------------------------------------------------------------- | ----------------------------------------------- |
| `--int_border-color, --kup-text-input_border-color`           | Set normal border color of the input            |
| `--int_border-color--selected, --kup-text-input_border-color` | Set color of the border when focused or hovered |
| `--int_font-size, --kup-text-input_font-size`                 | Set height of the font and the svg icon         |
| `--int_icon-color, --kup-text-input_icon-color`               | Set icon color                                  |
| `--int_icon-color--hover, --kup-text-input_icon-color--hover` | Set icon color when hovered                     |
| `--int_tr-duration, --kup-text-input_transition-duration`     | Set all transitions duration                    |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
