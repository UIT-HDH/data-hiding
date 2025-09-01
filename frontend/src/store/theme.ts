export type ThemeMode = 'light' | 'dark'

function getInitialTheme(): ThemeMode {
  const saved = localStorage.getItem('theme') as ThemeMode | null
  return saved === 'dark' ? 'dark' : 'light'
}

export const themeAtomKey = 'themeAtom'

// Simple theme store without recoil dependency
export const themeAtom = {
  key: themeAtomKey,
  default: getInitialTheme(),
  getValue: (): ThemeMode => {
    return getInitialTheme()
  },
  setValue: (value: ThemeMode) => {
    localStorage.setItem('theme', value)
  }
}
