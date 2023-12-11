'use client';

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
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

export default function Home() {
    const currentSocialPlatform = useGlobalState.use.currentSocialPlatform();
    const fetchAndStoreViews = useImpressionsStore.use.fetchAndStoreViews();
    const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isError, isPending, refetch, isFetching } =
        useSuspenseInfiniteQuery({
            queryKey: ['discover', currentSocialPlatform],
            networkMode: 'always',

            queryFn: async ({ pageParam }) => {
                switch (currentSocialPlatform) {
                    case SocialPlatform.Lens:
                        const result = await LensSocialMediaProvider.discoverPosts(
                            createIndicator(undefined, pageParam),
                        );
                        const ids = result.data.flatMap((x) => [x.postId]);
                        fetchAndStoreViews(ids);

                        return result;
                    case SocialPlatform.Farcaster:
                        return WarpcastSocialMediaProvider.discoverPosts(createIndicator(undefined, pageParam));
                    default:
                        return createPageable([], undefined);
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

    const posts = useMemo(() => data?.pages.flatMap((x) => x.data) || EMPTY_LIST, [data?.pages]);

    return (
        <div>
            {posts.length ? posts.map((x) => <SinglePost post={x} key={x.postId} showMore />) : <NoResultsFallback />}
            {hasNextPage && posts.length ? (
                <div className="flex items-center justify-center p-2" ref={observe}>
                    <LoadingIcon width={16} height={16} className="animate-spin" />
                </div>
            ) : null}
        </div>
    );
}
