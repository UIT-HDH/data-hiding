export type ThemeMode = 'light' | 'dark'

function getInitialTheme(): ThemeMode {
  const saved = localStorage.getItem('theme') as ThemeMode | null
  return saved === 'dark' ? 'dark' : 'light'
}

export const themeAtomKey = 'themeAtom'

import { atom } from 'recoil'

export const themeAtom = atom<ThemeMode>({
  key: themeAtomKey,
  default: getInitialTheme(),
  effects: [
    ({ onSet }) => {
      onSet((val) => localStorage.setItem('theme', val))
    },
  ],
})
