# wup-checkbox



<!-- Auto Generated Below -->


## Properties

| Property        | Attribute       | Description                                                                                      | Type      | Default |
| --------------- | --------------- | ------------------------------------------------------------------------------------------------ | --------- | ------- |
| `checked`       | `checked`       | Defaults at false. When set to true, the component will be set to 'checked'.                     | `boolean` | `false` |
| `custom`        | `custom`        | Defaults at false. When set to true, mixins and classes of customization are enabled.            | `boolean` | `false` |
| `disabled`      | `disabled`      | Defaults at false. When set to true, the component is disabled.                                  | `boolean` | `false` |
| `indeterminate` | `indeterminate` | Defaults at false. When set to true, the component will be set to 'indeterminate'.               | `boolean` | `false` |
| `labelleft`     | `labelleft`     | Defaults at null. When specified, its content is shown to the left of the component as a label.  | `string`  | `null`  |
| `labelright`    | `labelright`    | Defaults at null. When specified, its content is shown to the right of the component as a label. | `string`  | `null`  |


## Events

| Event               | Description | Type                           |
| ------------------- | ----------- | ------------------------------ |
| `kupCheckboxBlur`   |             | `CustomEvent<{ value: any; }>` |
| `kupCheckboxChange` |             | `CustomEvent<{ value: any; }>` |
| `kupCheckboxClick`  |             | `CustomEvent<{ value: any; }>` |
| `kupCheckboxFocus`  |             | `CustomEvent<{ value: any; }>` |
| `kupCheckboxInput`  |             | `CustomEvent<{ value: any; }>` |


## Dependencies

### Used by

 - [kup-checkbox-menu](../kup-checkbox-menu)

### Graph
```mermaid
graph TD;
  kup-checkbox-menu --> wup-checkbox
  style wup-checkbox fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
