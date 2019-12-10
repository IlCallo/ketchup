# kup-layout

## About this component

This is a component used to improve some common layout necessities.

Basically is just a wrapper for a CSS Grid layout, therefore you can also customize it with other Grid properties
by simply declaring them on the component.

<!-- Auto Generated Below -->


## Properties

| Property                   | Attribute                     | Description                                                                                                                                                                                                                   | Type      | Default |
| -------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------- |
| `columnsNumber`            | `columns-number`              | Specifies how many columns the content must be organized onto.  If this is greater than 1, then the horizontal prop will have no effect.                                                                                      | `number`  | `1`     |
| `contentBasedColumnsWidth` | `content-based-columns-width` | By default, columns size is calculated by the grid layout and it tries to give the same space to elements.  If this is true, columns width will be calculated according to the cells content. See SCSS file for more details. | `boolean` | `false` |
| `fillSpace`                | `fill-space`                  | When true, the layout and its contents will try to take all the available horizontal space.                                                                                                                                   | `boolean` | `false` |
| `horizontal`               | `horizontal`                  | Tells the layout to place all elements onto a single row. It does not work when columnsNumber is greater then 1.                                                                                                              | `boolean` | `false` |


## CSS Custom Properties

| Name                                             | Description                                                                                                                    |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `--lyo__column-number, --kup-lyo__column-number` | Number of columns. This property is regulated by the columnsNumber property, but can be overridden by !important declarations. |
| `--lyo__grid-gap, --kup-lyo__grid-gap`           | Space between two adjacent cells (on columns and rows).                                                                        |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
