import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

export const config: Config = {
    copy: [
        {
            src: 'box.html',
        },
        {
            src: 'chart.html',
        },
        {
            src: 'data-table.html',
        },
        {
            src: 'dash.html',
        },
    ],
    namespace: 'mycomponent',
    outputTargets: [
        { type: 'dist' },
        { type: 'docs-readme' },
        {
            type: 'www',
            serviceWorker: null, // disable service workers
        },
    ],
    plugins: [
        sass({
            injectGlobalPaths: [
                'src/style/_variables.scss',
                'src/style/_generic-style.scss',
                'src/materialize/sass/materialize.scss',
                'src/style/global.scss',
            ],
        }),
    ],
};
