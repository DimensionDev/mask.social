import { safeUnreachable } from '@masknet/kit';
import { useMemo } from 'react';

import { SocialPlatform } from '@/constants/enum.js';
import { useFarcasterStateStore, useLensStateStore } from '@/store/useProfileStore.js';

export function useIsLogin(source?: SocialPlatform) {
    const currentLensProfile = useLensStateStore.use.currentProfile();
    const currentFarcasterProfile = useFarcasterStateStore.use.currentProfile();

    return useMemo(() => {
        if (!source) return !!(currentLensProfile?.profileId || currentFarcasterProfile?.profileId);

        switch (source) {
            case SocialPlatform.Lens:
                return !!currentLensProfile?.profileId;
            case SocialPlatform.Farcaster:
                return !!currentFarcasterProfile?.profileId;
            default:
                safeUnreachable(source);
                return false;
        }
    }, [currentLensProfile, currentFarcasterProfile, source]);
}
