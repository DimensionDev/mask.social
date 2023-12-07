import { createIndicator, createPageable } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useInView } from 'react-cool-inview';

import LoadingIcon from '@/assets/loading.svg';
import { NoResultsFallback } from '@/components/NoResultsFallback.js';
import { SinglePost } from '@/components/Posts/SinglePost.js';
import { SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { WarpcastSocialMediaProvider } from '@/providers/warpcast/SocialMedia.js';
import { useFarcasterStateStore } from '@/store/useFarcasterStore.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';
import { useLensStateStore } from '@/store/useLensStore.js';

export default function ContentFeed() {
    const currentSocialPlatform = useGlobalState.use.currentSocialPlatform();
    const currentLensProfile = useLensStateStore.use.currentProfile();
    const currentFarcasterProfile = useFarcasterStateStore.use.currentProfile();
    const fetchAndStoreViews = useImpressionsStore.use.fetchAndStoreViews();
    const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isFetching } = useSuspenseInfiniteQuery({
        queryKey: ['getPostsByProfileId', currentSocialPlatform],

        queryFn: async ({ pageParam }) => {
            switch (currentSocialPlatform) {
                case SocialPlatform.Lens:
                    if (!currentLensProfile?.profileId) return createPageable(EMPTY_LIST, undefined);
                    const result = await LensSocialMediaProvider.getPostsByProfileId(
                        currentLensProfile?.profileId,
                        createIndicator(undefined, pageParam),
                    );
                    const ids = result.data.flatMap((x) => [x.postId]);
                    await fetchAndStoreViews(ids);

                    return result;
                case SocialPlatform.Farcaster:
                    if (!currentFarcasterProfile?.profileId) return createPageable(EMPTY_LIST, undefined);
                    return WarpcastSocialMediaProvider.getPostsByProfileId(
                        currentFarcasterProfile?.profileId,
                        createIndicator(undefined, pageParam),
                    );
                default:
                    return createPageable(EMPTY_LIST, undefined);
            }
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextIndicator?.id,
    });

    const { observe } = useInView({
        rootMargin: '300px 0px',
        onChange: async ({ inView }) => {
            if (!inView || !hasNextPage || isFetching || isFetchingNextPage) {
                return;
            }
            await fetchNextPage();
        },
    });

    const results = useMemo(() => data.pages.flatMap((x) => x.data), [data]);

    return (
        <div>
            {results.length ? (
                results.map((x) => <SinglePost post={x} key={x.postId} showMore />)
            ) : (
                <NoResultsFallback />
            )}
            {hasNextPage && results.length > 0 ? (
                <div className="flex items-center justify-center p-2" ref={observe}>
                    <LoadingIcon width={16} height={16} className="animate-spin" />
                </div>
            ) : null}
        </div>
    );
}