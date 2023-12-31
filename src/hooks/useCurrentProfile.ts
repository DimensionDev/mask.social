import { safeUnreachable } from '@masknet/kit';

import { SocialPlatform } from '@/constants/enum.js';
import { useFarcasterStateStore, useLensStateStore } from '@/store/useProfileStore.js';

export function useCurrentProfile(source: SocialPlatform) {
    const currentLensProfile = useLensStateStore.use.currentProfile?.();
    const currentFarcasterProfile = useFarcasterStateStore.use.currentProfile?.();

    switch (source) {
        case SocialPlatform.Lens:
            return currentLensProfile;
        case SocialPlatform.Farcaster:
            return currentFarcasterProfile;
        default:
            safeUnreachable(source);
            return null;
    }
}
