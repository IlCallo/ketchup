import { getTheme } from '../util/mwc-util';
import setupJss from '../styles/setup-jss';
import deepmerge from 'deepmerge';
import createTheme from '../styles/create-theme';
import { fade } from '../styles/color-manipulator';
const formatMs = (milliseconds: number) => `${Math.round(milliseconds)}ms`;
import { ThemeOptions, Theme } from '../styles/theme';

export const rippleColors = {
    default: '',
    primary: '',
    secondary: '',
    white: '',
};

class ButtonStyle {
    theme: Theme;
    defaultStyle: object;
    constructor() {
        this.theme = createTheme(getTheme());
        this.defaultStyle = {
            root: {
                ...this.theme.typography.button,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                lineHeight: '1.4em',
                boxSizing: 'border-box',
                minWidth: 88,
                minHeight: 36,
                padding: `${this.theme.spacing.unit}px ${this.theme.spacing
                    .unit * 2}px`,
                borderRadius: 2,
                color: this.theme.palette.text.primary,
                WebkitTapHighlightColor: this.theme.palette.common.transparent,
                backgroundColor: 'transparent', // Reset default value
                outline: 'none',
                border: 0,
                cursor: 'pointer',
                userSelect: 'none',
                verticalAlign: 'middle',
                appearance: 'none',
                textDecoration: 'none',
                '&::-moz-focus-inner': {
                    borderStyle: 'none', // Remove Firefox dotted outline.
                },
                transition: `background-color ${formatMs(
                    this.theme.transitions.duration.short
                )}, box-shadow ${formatMs(
                    this.theme.transitions.duration.short
                )}`,
                '&:hover': {
                    textDecoration: 'none',
                    // Reset on mouse devices
                    backgroundColor: fade(
                        this.theme.palette.text.primary,
                        0.12
                    ),
                    '@media (hover: none)': {
                        backgroundColor: 'transparent',
                    },
                    '&$disabled': {
                        backgroundColor: 'transparent',
                    },
                },
                '&:active': {
                    outline: 'none',
                },
            },
            disabled: {
                pointerEvents: 'none', // Disable link interactions
                cursor: 'default',
                backgroundColor: 'transparent',
                color: this.theme.palette.action.disabled,
            },
            dense: {
                padding: `${this.theme.spacing.unit - 1}px ${
                    this.theme.spacing.unit
                }px`,
                minWidth: 64,
                minHeight: 32,
                fontSize: this.theme.typography.pxToRem(
                    this.theme.typography.fontSize - 1
                ),
            },
            label: {
                width: '100%',
                display: 'inherit',
                alignItems: 'inherit',
                justifyContent: 'inherit',
            },
            flatPrimary: {
                color: this.theme.palette.primary[500],
                '&:hover': {
                    backgroundColor: fade(
                        this.theme.palette.primary[500],
                        0.12
                    ),
                    // Reset on mouse devices
                    '@media (hover: none)': {
                        backgroundColor: 'transparent',
                    },
                },
            },
            flatSecondary: {
                color: this.theme.palette.secondary['A200'],
                '&:hover': {
                    backgroundColor: fade(
                        this.theme.palette.secondary['A200'],
                        0.12
                    ),
                    // Reset on mouse devices
                    '@media (hover: none)': {
                        backgroundColor: 'transparent',
                    },
                },
            },
            flatContrast: {
                color: this.theme.palette.getContrastText(
                    this.theme.palette.primary[500]
                ),
                '&:hover': {
                    backgroundColor: fade(
                        this.theme.palette.getContrastText(
                            this.theme.palette.primary[500]
                        ),
                        0.12
                    ),
                    // Reset on mouse devices
                    '@media (hover: none)': {
                        backgroundColor: 'transparent',
                    },
                },
            },
            colorInherit: {
                color: 'inherit',
            },
            stroked: {
                borderStyle: 'solid',
                borderColor: this.theme.palette.grey[300],
                borderWidth: '2px',
            },
            strokedPrimary: {
                borderStyle: 'solid',
                borderColor: this.theme.palette.primary[500],
                borderWidth: '2px',
            },
            strokedSecondary: {
                borderStyle: 'solid',
                borderColor: this.theme.palette.secondary['A200'],
                borderWidth: '2px',
            },
            strokedContrast: {
                borderStyle: 'solid',
                borderColor: fade(
                    this.theme.palette.getContrastText(
                        this.theme.palette.primary[500]
                    ),
                    0.12
                ),
                borderWidth: '2px',
            },
            raised: {
                color: this.theme.palette.getContrastText(
                    this.theme.palette.grey[300]
                ),
                backgroundColor: this.theme.palette.grey[300],
                boxShadow: this.theme.shadows[2],
                '&$keyboardFocused': {
                    boxShadow: this.theme.shadows[6],
                },
                '&:active': {
                    boxShadow: this.theme.shadows[8],
                },
                '&$disabled': {
                    boxShadow: this.theme.shadows[0],
                    color: this.theme.palette.action.disabled,
                    backgroundColor: this.theme.palette.text.divider,
                },
                '&:hover': {
                    backgroundColor: this.theme.palette.grey.A100,
                    // Reset on mouse devices
                    '@media (hover: none)': {
                        backgroundColor: this.theme.palette.grey[300],
                    },
                    '&$disabled': {
                        backgroundColor: this.theme.palette.text.divider,
                        color: this.theme.palette.action.disabled,
                        // Reset on mouse devices
                        '@media (hover: none)': {
                            backgroundColor: this.theme.palette.grey[300],
                        },
                    },
                },
            },
            keyboardFocused: {},
            raisedPrimary: {
                color: this.theme.palette.getContrastText(
                    this.theme.palette.primary[500]
                ),
                backgroundColor: this.theme.palette.primary[500],
                '&:hover': {
                    backgroundColor: this.theme.palette.primary[700],
                    // Reset on mouse devices
                    '@media (hover: none)': {
                        backgroundColor: this.theme.palette.primary[500],
                    },
                },
            },
            raisedSecondary: {
                color: this.theme.palette.getContrastText(
                    this.theme.palette.secondary['A200']
                ),
                backgroundColor: this.theme.palette.secondary['A200'],
                '&:hover': {
                    backgroundColor: this.theme.palette.secondary['A400'],
                    // Reset on mouse devices
                    '@media (hover: none)': {
                        backgroundColor: this.theme.palette.secondary['A200'],
                    },
                },
            },
            raisedContrast: {
                color: this.theme.palette.getContrastText(
                    this.theme.palette.primary[500]
                ),
            },

            fab: {
                borderRadius: '50%',
                padding: 0,
                minWidth: 0,
                width: 56,
                height: 56,
                boxShadow: this.theme.shadows[6],
                '&:active': {
                    boxShadow: this.theme.shadows[12],
                },
            },
            mini: {
                width: 40,
                height: 40,
            },
        };
    }

    jss: any;
    setup(style: object) {
        const mergedStyles = deepmerge.all([this.defaultStyle, style]);
        rippleColors.default = fade(this.theme.palette.text.primary, 0.3);
        rippleColors.primary = fade(this.theme.palette.primary[500], 0.3);
        rippleColors.secondary = fade(
            this.theme.palette.secondary['A200'],
            0.3
        );
        rippleColors.white = fade('#ffffff', 0.5);
        this.jss = new setupJss();
        this.jss.attachStyleSheet(mergedStyles);
    }
    getClassName(type: Array<string>): string {
        return this.jss.getClassName(type);
    }
}
export default ButtonStyle;
