import { createTheme, type PaletteMode } from '@mui/material/styles'

// Brand colors
const EVERGREEN = '#1F4D3A'
const CABIN_GOLD = '#D9A441'
const MOUNTAIN_MIST = '#E8ECEB'
const PINE_SHADOW = '#2C3A32'

export const createAppTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'dark' ? CABIN_GOLD : EVERGREEN,
      },
      secondary: {
        main: mode === 'dark' ? EVERGREEN : CABIN_GOLD,
      },
      background: {
        default: mode === 'dark' ? '#1a1a1a' : MOUNTAIN_MIST,
        paper: mode === 'dark' ? PINE_SHADOW : '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
    },
  })

// Legacy static export for anything that still imports `theme` directly
export const theme = createAppTheme('light')
