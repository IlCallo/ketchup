import deepmerge from 'deepmerge';
import createTypography from './create-typography';
import createBreakpoints from './create-breakpoints';
import createPalette from './create-palette';
import createMixins from './create-mixins';
import shadows from './create-shadows';
import transitions from './create-transitions';
import zIndex from './create-zindex';
import spacing from './create-spacing';
import { ThemeOptions, Theme } from './theme';

function createTheme(options?: any): Theme {
    const {
        palette: paletteInput = {},
        breakpoints: breakpointsInput = {},
        mixins: mixinsInput = {},
        typography: typographyInput = {},
        shadows: shadowsInput,
        ...other
    } = options;

    console.log('Injected theme: ' + JSON.stringify(options));

    // let shadows:Shadows = options['shadows']

    const palette = createPalette(paletteInput);
    const breakpoints = createBreakpoints(breakpointsInput);

    let muiTheme = {
        direction: 'ltr',
        palette,
        typography: createTypography(palette, typographyInput),
        mixins: createMixins(breakpoints, spacing, mixinsInput),
        breakpoints,
        shadows: shadowsInput || shadows,
        ...deepmerge(
            {
                transitions,
                spacing,
                zIndex,
            },
            other
        ),
    };

    muiTheme = deepmerge(muiTheme, options);

    console.log('MUI theme:' + JSON.stringify(muiTheme));

    return muiTheme;
}

export default createTheme;
