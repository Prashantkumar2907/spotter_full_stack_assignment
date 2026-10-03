import {
  ActionIcon,
  Button,
  Drawer,
  Input,
  InputWrapper,
  Modal,
  Popover,
  Tooltip,
  createTheme,
  type CSSVariablesResolver,
  type MantineColorsTuple,
} from '@mantine/core'

const route: MantineColorsTuple = [
  '#e8f6ef',
  '#cdebdc',
  '#9dd6b9',
  '#69c094',
  '#40ad76',
  '#25a063',
  '#159457',
  '#0b7f49',
  '#066a3c',
  '#00552f',
]

const signal: MantineColorsTuple = [
  '#fff8e1',
  '#ffefc4',
  '#ffdf8a',
  '#ffcd4b',
  '#ffbf1f',
  '#ffb500',
  '#e6a100',
  '#b07a00',
  '#946500',
  '#7a5200',
]

const stone: MantineColorsTuple = [
  '#f7f6f3',
  '#efede8',
  '#e4e1da',
  '#d4d0c6',
  '#b9b4a8',
  '#97928a',
  '#77736b',
  '#5c5952',
  '#403e39',
  '#25241f',
]

const asphalt: MantineColorsTuple = [
  '#e9eaeb',
  '#b8bdc2',
  '#9aa0a6',
  '#6b7178',
  '#3a4047',
  '#2b3036',
  '#1c2024',
  '#15181b',
  '#101315',
  '#0b0d0f',
]

const OVERLAY = { backgroundOpacity: 0.45, blur: 3 }

export const theme = createTheme({
  primaryColor: 'route',
  primaryShade: { light: 7, dark: 6 },
  colors: { route, signal, gray: stone, dark: asphalt },
  white: '#ffffff',
  black: '#1d1c19',
  fontFamily: "'Public Sans Variable', system-ui, -apple-system, 'Segoe UI', sans-serif",
  fontFamilyMonospace: "'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, monospace",
  headings: { fontFamily: "'Overpass Variable', 'Arial Narrow', system-ui, sans-serif", fontWeight: '800' },
  defaultRadius: 'md',
  cursorType: 'pointer',
  focusRing: 'auto',
  components: {
    Button: Button.extend({ defaultProps: { radius: 'xl' } }),
    ActionIcon: ActionIcon.extend({ defaultProps: { radius: 'xl' } }),
    Tooltip: Tooltip.extend({ defaultProps: { withArrow: true, openDelay: 250, arrowSize: 6, color: 'dark.7' } }),
    Popover: Popover.extend({ defaultProps: { radius: 'md', shadow: 'lg' } }),
    Modal: Modal.extend({ defaultProps: { radius: 'lg', overlayProps: OVERLAY } }),
    Drawer: Drawer.extend({ defaultProps: { overlayProps: OVERLAY } }),
    InputWrapper: InputWrapper.extend({
      defaultProps: { inputWrapperOrder: ['label', 'input', 'description', 'error'] },
      styles: {
        label: { fontSize: 'var(--mantine-font-size-sm)', fontWeight: 600, marginBottom: 6 },
        description: { fontSize: 'var(--mantine-font-size-xs)', marginTop: 6 },
        error: { fontSize: 'var(--mantine-font-size-xs)', marginTop: 6 },
      },
    }),
    Input: Input.extend({ defaultProps: { size: 'md' } }),
  },
})

const LIGHT_SURFACES = {
  '--mantine-color-body': '#f6f5f1',
  '--mantine-color-text': '#1d1c19',
  '--mantine-color-dimmed': '#6b675f',
  '--mantine-color-default': '#ffffff',
  '--mantine-color-default-hover': '#f2f0eb',
  '--mantine-color-default-border': '#d4d0c6',
  '--mantine-color-placeholder': '#97928a',
}

const DARK_SURFACES = {
  '--mantine-color-body': '#15181b',
  '--mantine-color-text': '#e9eaeb',
  '--mantine-color-dimmed': '#9aa0a6',
  '--mantine-color-default': '#1c2024',
  '--mantine-color-default-hover': '#262b30',
  '--mantine-color-default-border': '#3a4047',
  '--mantine-color-placeholder': '#6b7178',
}

export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: LIGHT_SURFACES,
  dark: DARK_SURFACES,
})
