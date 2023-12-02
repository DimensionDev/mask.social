'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useDocumentTitle } from 'usehooks-ts';

import ContentTabs from '@/app/profile/components/ContentTabs.js';
import Info from '@/app/profile/components/Info.js';
import Title from '@/app/profile/components/Title.js';
import { SocialPlatform } from '@/constants/enum.js';
import { createPageTitle } from '@/helpers/createPageTitle.js';
import { useLogin } from '@/hooks/useLogin.js';
import { usePlatformAccount } from '@/hooks/usePlatformAccount.js';
import { LensSocialMedia } from '@/providers/lens/SocialMedia.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

const lensClient = new LensSocialMedia();

interface ProfileProps {
    params: { handle: string };
}
export default function Profile({ params: { handle } }: ProfileProps) {
    const [tab, setTab] = useState<SocialPlatform>(SocialPlatform.Lens);

    const { data: profile } = useQuery({
        queryKey: ['profile', handle],
        queryFn: () => lensClient.getProfileByHandle(`lens/${handle}`),
    });

    const isLogin = useLogin();

    const platformAccount = usePlatformAccount();

    const isMyProfile = useMemo(
        () => !!isLogin && platformAccount.lens?.handle === handle,
        [handle, isLogin, platformAccount.lens?.handle],
    );

    const title = useMemo(() => {
        if (!profile) return '';
        const fragments = [profile.displayName];
        if (profile.handle) fragments.push(`(@${profile.handle})`);
        return createPageTitle(fragments.join(' '));
    }, [profile]);

    useDocumentTitle(title);

    return (
        <div>
            {!isMyProfile ? <Title profile={profile} isMyProfile={isMyProfile} /> : null}

            <Info platform={tab} profile={profile} isMyProfile={isMyProfile} />

            <ContentTabs />
        </div>
    );
}
