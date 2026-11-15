import { createTheme, DEFAULT_THEME, MantineColorsTuple } from '@mantine/core'

import { variantColorResolver } from './colors-resolver'
import components from './overrides'

const tintedGray: MantineColorsTuple = [
    '#F6EFF3',
    '#EADFE5',
    '#D9C9D2',
    '#C2AEBA',
    '#A6909C',
    '#8B7581',
    '#715D68',
    '#584852',
    '#41343C',
    '#2C2228'
]

const plum: MantineColorsTuple = [
    '#F3EEFF',
    '#E2D6FF',
    '#CDB8FF',
    '#B591FF',
    '#A07BFA',
    '#8E66F3',
    '#7C4DEB',
    '#6B3FD6',
    '#5B34BA',
    '#4A2A99'
]

const coral: MantineColorsTuple = [
    '#FFF1EB',
    '#FFDCCD',
    '#FFC1A8',
    '#FFA684',
    '#FF9469',
    '#FF8A5C',
    '#F87C4C',
    '#F0703F',
    '#E8653A',
    '#C9532C'
]

const rose: MantineColorsTuple = [
    '#FFEEF5',
    '#FFD6E7',
    '#FFB8D4',
    '#FF9AC3',
    '#FF7DB5',
    '#F563A2',
    '#E84D92',
    '#DC4286',
    '#D23A7C',
    '#B42F69'
]

export const theme = createTheme({
    variantColorResolver,
    components,
    cursorType: 'pointer',
    fontFamily: 'var(--font-sans)',
    fontFamilyMonospace: 'Fira Mono, monospace',
    breakpoints: {
        xs: '30em',
        sm: '40em',
        md: '48em',
        lg: '64em',
        xl: '80em',
        '2xl': '96em',
        '3xl': '120em',
        '4xl': '160em'
    },

    scale: 1,
    fontSmoothing: true,
    focusRing: 'never',
    white: '#ffffff',
    black: '#24292f',
    colors: {
        // Greys tinted toward magenta; green stays below blue in every step so nothing reads brown.
        dark: [
            '#E3D5DD',
            '#C9B6C1',
            '#A08D98',
            '#7D6A75',
            '#4F3E48',
            '#372A32',
            '#271C23',
            '#1B1218',
            '#130C11',
            '#0A0609'
        ],
        rose,
        // Mantine's gray is a cool blue-grey; tint it like `dark` so neutral controls sit in the rose world.
        gray: tintedGray,
        // Lime marked help and info icons; Umiji has no yellow-green, so it reads as the neutral.
        lime: tintedGray,
        // Cyan was the inherited brand accent across the app; Umiji's accent is rose.
        cyan: rose,
        // No yellow in Umiji: warnings use coral.
        yellow: coral,
        'shaded-gray': tintedGray,
        // The inherited decorative hues collapse into the Umiji family, so every leftover
        // color="violet" / c="blue.5" / var(--mantine-color-grape-6) lands in the palette:
        // purples and blues become plum, pink becomes rose, green joins teal (success)
        // and orange joins coral (warning).
        violet: plum,
        grape: plum,
        indigo: plum,
        blue: plum,
        pink: rose,
        green: DEFAULT_THEME.colors.teal,
        orange: coral
    },
    primaryShade: 8,
    primaryColor: 'rose',
    autoContrast: true,
    luminanceThreshold: 0.3,
    headings: {
        fontWeight: '600'
    },
    defaultRadius: 'md'
})
