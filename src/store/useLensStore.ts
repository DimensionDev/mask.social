import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { createSelectors } from '@/helpers/createSelector.js';
import type { SocialMediaAccount } from '@/types/index.js';

export interface LensState {
    accounts: SocialMediaAccount[];
    currentAccount: SocialMediaAccount;
    updateCurrentAccount: (account: SocialMediaAccount) => void;
    updateAccounts: (accounts: SocialMediaAccount[]) => void;
    clearCurrentAccount: () => void;
}

const useLensStateBase = create<LensState, [['zustand/persist', unknown], ['zustand/immer', unknown]]>(
    persist(
        immer((set, get) => ({
            accounts: EMPTY_LIST,
            currentAccount: {
                profileId: '',
                avatar: '',
                name: '',
                id: '',
                platform: SocialPlatform.Lens,
            },
            updateCurrentAccount: (account: SocialMediaAccount) =>
                set((state) => {
                    state.currentAccount = account;
                }),
            updateAccounts: (accounts: SocialMediaAccount[]) =>
                set((state) => {
                    state.accounts = accounts;
                }),
            clearCurrentAccount: () =>
                set((state) => {
                    state.currentAccount = {
                        profileId: '',
                        avatar: '',
                        name: '',
                        id: '',
                        platform: SocialPlatform.Lens,
                    };
                }),
        })),
        {
            name: 'lens-state',
            partialize: (state) => ({ accounts: state.accounts, currentAccount: state.currentAccount }),
        },
    ),
);

export const useLensStateStore = createSelectors(useLensStateBase);
