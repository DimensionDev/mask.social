import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { createSelectors } from '@/helpers/createSelector.js';
import type { ThemeMode } from '@/types/index.js';

export interface ThemeModeState {
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
}

const useThemeModeStateBase = create<ThemeModeState, [['zustand/persist', unknown], ['zustand/immer', unknown]]>(
    persist(
        immer((set, get) => ({
            themeMode: 'default',
            setThemeMode: (mode) => {
                set((state) => {
                    state.themeMode = mode;
                });
            },
        })),
        {
            name: 'global-theme-state',
            partialize: (state) => ({ mode: state.themeMode }),
        },
    ),
);

export const useThemeModeStore = createSelectors(useThemeModeStateBase);
