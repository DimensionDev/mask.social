'use client';

import { redirect } from 'next/navigation.js';

import { NotLoginFallback } from '@/components/NotLoginFallback.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { usePlatformProfile } from '@/hooks/usePlatformProfile.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export default function ProfileHome() {
    const currentSocialPlatform = useGlobalState.use.currentSocialPlatform();
    const isLogin = useIsLogin(currentSocialPlatform);
    const platformProfile = usePlatformProfile();
    if (!isLogin || !platformProfile.lens?.handle) {
        return <NotLoginFallback platform={currentSocialPlatform} />;
    }
    redirect(`/profile/${platformProfile.lens.handle}`);
}
