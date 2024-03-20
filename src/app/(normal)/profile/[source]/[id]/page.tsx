'use client';

import { useQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation.js';
import { useMemo } from 'react';
import { useDocumentTitle } from 'usehooks-ts';

import { Loading } from '@/components/Loading.js';
import { ContentTabs } from '@/components/Profile/ContentTabs.js';
import { Info } from '@/components/Profile/Info.js';
import { Title } from '@/components/Profile/Title.js';
import type { SourceInURL } from '@/constants/enum.js';
import { SITE_NAME } from '@/constants/index.js';
import { createPageTitle } from '@/helpers/createPageTitle.js';
import { resolveSocialPlatform } from '@/helpers/resolveSocialPlatform.js';
import { useUpdateCurrentVisitingProfile } from '@/hooks/useCurrentVisitingProfile.js';
import { useIsMyProfile } from '@/hooks/useIsMyProfile.js';
import { getProfileById } from '@/services/getProfileById.js';

interface PageProps {
    params: {
        id: string;
        source: SourceInURL;
    };
}
export default function Page({ params: { source: _source, id: handleOrProfileId } }: PageProps) {
    const currentSource = resolveSocialPlatform(_source);
    const isMyProfile = useIsMyProfile(currentSource, handleOrProfileId);

    const { data: profile = null, isLoading } = useQuery({
        queryKey: ['profile', currentSource, handleOrProfileId],
        queryFn: () => getProfileById(currentSource, handleOrProfileId),
    });

    const title = useMemo(() => {
        if (!profile) return SITE_NAME;
        const fragments = [profile.displayName];
        if (profile.handle) fragments.push(`(@${profile.handle})`);
        return createPageTitle(fragments.join(' '));
    }, [profile]);

    useDocumentTitle(title);
    useUpdateCurrentVisitingProfile(profile);

    if (isLoading) {
        return <Loading />;
    }

    if (!profile) {
        notFound();
    }

    return (
        <div>
            {!isMyProfile ? <Title profile={profile} /> : null}

            <Info profile={profile} isMyProfile={isMyProfile} source={currentSource} />

            <ContentTabs source={profile.source} profileId={profile.profileId} />
        </div>
    );
}
