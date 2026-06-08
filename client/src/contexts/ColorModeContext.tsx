import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import type { PaletteMode } from '@mui/material'
import { createAppTheme } from '@/lib/theme'

const STORAGE_KEY = 'cabin-care-color-mode'

interface ColorModeContextValue {
  mode: PaletteMode
  toggleColorMode: () => void
}

const ColorModeContext = createContext<ColorModeContextValue>({
  mode: 'light',
  toggleColorMode: () => {},
})

export function useColorMode() {
  return useContext(ColorModeContext)
}

export function ColorModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<PaletteMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'dark' ? 'dark' : 'light'
  })

  const toggleColorMode = () => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem(STORAGE_KEY, next)
      return next
    })
  }

  const theme = useMemo(() => createAppTheme(mode), [mode])

  const value = useMemo(() => ({ mode, toggleColorMode }), [mode])

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}
