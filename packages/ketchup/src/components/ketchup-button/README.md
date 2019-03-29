# ketchup-button



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute      | Description | Type      | Default                                                                        |
| ------------- | -------------- | ----------- | --------- | ------------------------------------------------------------------------------ |
| `align`       | `align`        |             | `string`  | `undefined`                                                                    |
| `borderColor` | `border-color` |             | `string`  | `undefined`                                                                    |
| `buttonClass` | `button-class` |             | `string`  | `undefined`                                                                    |
| `fillspace`   | `fillspace`    |             | `boolean` | `false`                                                                        |
| `flat`        | `flat`         |             | `boolean` | `false`                                                                        |
| `iconClass`   | `icon-class`   |             | `string`  | `undefined`                                                                    |
| `iconUrl`     | `icon-url`     |             | `string`  | `'https://cdn.materialdesignicons.com/3.2.89/css/materialdesignicons.min.css'` |
| `label`       | `label`        |             | `string`  | `undefined`                                                                    |
| `rounded`     | `rounded`      |             | `boolean` | `false`                                                                        |
| `showicon`    | `showicon`     |             | `boolean` | `true`                                                                         |
| `showtext`    | `showtext`     |             | `boolean` | `true`                                                                         |
| `textmode`    | `textmode`     |             | `string`  | `undefined`                                                                    |
| `transparent` | `transparent`  |             | `boolean` | `false`                                                                        |


## Events

| Event                  | Description | Type                                       |
| ---------------------- | ----------- | ------------------------------------------ |
| `ketchupButtonClicked` |             | `CustomEvent<{         id: string;     }>` |


## CSS Custom Properties

| Name                                                                  | Description                                                                                  |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `--btn_animation-duration, --kup-button_animation-duration`           | Sets duration of all transitions of the component.                                           |
| `--btn_border-color, --kup-button_border-color`                       | Sets border color of the button only when it is transparent. Falls back to --btn_main-color. |
| `--btn_color-danger`                                                  | Background color of the button when danger state is set                                      |
| `--btn_color-danger--hover`                                           | Background color of the button when danger:hover state is set                                |
| `--btn_color-info`                                                    | Background color of the button when info state is set                                        |
| `--btn_color-selected`                                                | Background color of the button when selected state is set                                    |
| `--btn_color-warning`                                                 | Background color of the button when warning state is set                                     |
| `--btn_font-size, --kup-button_font-size`                             | Sets button font size.                                                                       |
| `--btn_icon--transparent, --kup-button_icon-color--transparent`       | Sets icon color when button is transparent. Falls back to --btn_text-color--transparent.     |
| `--btn_icon-color, --kup-button_icon-color`                           | Sets icon color. Falls back to --btn_text-color.                                             |
| `--btn_icon-size, --kup-button_icon-size`                             | Set icon size.                                                                               |
| `--btn_main-color, --kup-button_main-color`                           | Sets the main color of the button.                                                           |
| `--btn_text-color, --kup-button_text-color`                           | Sets color of the button text.                                                               |
| `--btn_text-color--transparent, --kup-button_text-color--transparent` | Sets text color when button is transparent. Falls back to --btn_main-color.                  |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
