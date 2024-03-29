'use client';
import { useQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation.js';

import { ProfilePage } from '@/app/(normal)/profile/pages/Profile.js';
import { Loading } from '@/components/Loading.js';
import type { SourceInURL } from '@/constants/enum.js';
import { resolveSocialPlatform } from '@/helpers/resolveSocialPlatform.js';
import { getProfileById } from '@/services/getProfileById.js';

interface PageProps {
    params: {
        id: string;
        source: SourceInURL;
    };
}

export default function Page({ params: { source, id: handleOrProfileId } }: PageProps) {
    const currentSource = resolveSocialPlatform(source);

    const { data: profile = null, isLoading } = useQuery({
        queryKey: ['profile', currentSource, handleOrProfileId],
        queryFn: () => getProfileById(currentSource, handleOrProfileId),
    });

    if (isLoading) {
        return <Loading />;
    }

    if (!profile) {
        notFound();
    }

    return <ProfilePage profile={profile} />;
}
