import { Select } from '@lingui/macro';
import { delay, safeUnreachable } from '@masknet/kit';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAsyncFn } from 'react-use';

import { SocialPlatform } from '@/constants/enum.js';
import { useIsMyProfile } from '@/hooks/useIsMyProfile.js';
import { useCustomSnackbar } from '@/hooks/useCustomSnackbar.js';
import { useIsFollowing } from '@/hooks/useIsFollowing.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useUnmountRef } from '@/hooks/useUnmountRef.js';
import { LoginModalRef } from '@/modals/controls.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/index.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export function useToggleFollow(profile: Profile) {
    const { profileId, handle, source } = profile;
    const isLogin = useIsLogin(source);
    const enqueueSnackbar = useCustomSnackbar();
    const [touched, setTouched] = useState(false);
    // Request received, but state might not update yet.
    const [received, setReceived] = useState(false);

    const handleOrProfileId = profile.source === SocialPlatform.Lens ? profile.handle : profile.profileId;
    const isMyProfile = useIsMyProfile(profile.source, handleOrProfileId);

    const previousIsFollowing = isMyProfile || !!profile?.viewerContext?.following;
    const [isFollowing, refresh] = useIsFollowing({
        profile,
        placeholder: previousIsFollowing,
        enabled: touched,
    });
    const followState = received ? !previousIsFollowing : isFollowing;
    const followStateRef = useRef(followState);
    useEffect(() => {
        followStateRef.current = followState;
    });
    const handleToggleFollow = useCallback(async () => {
        if (!profileId || isMyProfile) return;
        if (!isLogin) {
            LoginModalRef.open();
            return;
        }
        try {
            switch (source) {
                case SocialPlatform.Lens:
                    await (followStateRef.current
                        ? LensSocialMediaProvider.unfollow(profileId)
                        : LensSocialMediaProvider.follow(profileId));
                    break;
                case SocialPlatform.Farcaster:
                    await (followStateRef.current
                        ? FarcasterSocialMediaProvider.unfollow(profileId)
                        : FarcasterSocialMediaProvider.follow(profileId));
                    break;
                default:
                    safeUnreachable(source);
                    return;
            }
            enqueueSnackbar(
                <Select
                    value={followStateRef.current ? 'unfollow' : 'follow'}
                    _follow={`Followed @${handle} on ${source}`}
                    _unfollow={`UnFollowed @${handle} on ${source}`}
                    other={`Followed @${handle} on ${source}`}
                />,
                {
                    variant: 'success',
                },
            );
            return;
        } catch (error) {
            if (error instanceof Error) {
                enqueueSnackbar(
                    <Select
                        value={followStateRef.current ? 'unfollow' : 'follow'}
                        _follow={`Failed to followed @${handle} on ${source}`}
                        _unfollow={`Failed to unfollowed @${handle} on ${source}`}
                        other={`Failed to followed @${handle} on ${source}`}
                    />,
                    {
                        variant: 'error',
                    },
                );
            }
        }
    }, [profileId, isLogin, source, enqueueSnackbar, handle, isMyProfile]);

    const unmountRef = useUnmountRef();
    const [state, handleToggle] = useAsyncFn(async () => {
        setReceived(false);
        setTouched(true);
        await handleToggleFollow();
        if (unmountRef.current) return;
        setReceived(true);

        // Await for API gets updated
        await delay(7000);
        if (unmountRef.current) return;
        setTouched(true);
        await refresh();

        if (unmountRef.current) return;
        setReceived(false);
    }, [handleToggleFollow, refresh]);

    // Update optimistically after follow/unfollow request gets received
    return [followState, state, handleToggle] as const;
}
