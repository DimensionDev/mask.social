'use client';

import { Trans } from '@lingui/macro';
import dynamic from 'next/dynamic.js';
import { useRouter } from 'next/navigation.js';
import { forwardRef } from 'react';
import urlcat from 'urlcat';

import EyeSlash from '@/assets/eye-slash.svg';
import Lock from '@/assets/lock.svg';
import { Markup } from '@/components/Markup/index.js';
import Oembed from '@/components/Oembed/index.js';
import { Attachments } from '@/components/Posts/Attachment.js';
import { DecryptPost } from '@/components/Posts/DecryptPost.js';
import { Quote } from '@/components/Posts/Quote.js';
import { classNames } from '@/helpers/classNames.js';
import type { Post } from '@/providers/types/SocialMedia.js';

const MaskRuntime = dynamic(() => import('@/components/MaskRuntime.js'), {
    ssr: false,
});

interface PostBodyProps {
    post: Post;
    isQuote?: boolean;
    showMore?: boolean;
}

export const PostBody = forwardRef<HTMLDivElement, PostBodyProps>(function PostBody(
    { post, isQuote = false, showMore = false },
    ref,
) {
    const router = useRouter();
    const canShowMore = !!(post.metadata.content?.content && post.metadata.content?.content.length > 450) && showMore;
    const showAttachments = !!(
        (post.metadata.content?.attachments && post.metadata.content?.attachments?.length > 0) ||
        post.metadata.content?.asset
    );

    if (post.isEncrypted) {
        return (
            <div className="my-2 pl-[52px]" ref={ref}>
                <div
                    className={classNames('flex items-center gap-1 rounded-lg border-primaryMain px-3 py-[6px]', {
                        border: !isQuote,
                    })}
                >
                    <Lock width={16} height={16} />
                    <Trans>Post has been encrypted</Trans>
                </div>
            </div>
        );
    }

    if (post.isHidden) {
        <div className="my-2 pl-[52px]" ref={ref}>
            <div
                className={classNames('flex items-center gap-1 rounded-lg border-primaryMain px-3 py-[6px]', {
                    border: !isQuote,
                })}
            >
                <EyeSlash width={16} height={16} />
                <Trans>Post has been hidden</Trans>
            </div>
        </div>;
    }

    if (isQuote) {
        return (
            <div className="my-2 flex items-center space-x-2 break-words text-base text-main">
                <Markup className="markup linkify text-md line-clamp-5 w-full self-stretch break-words opacity-75 dark:opacity-50">
                    {post.metadata.content?.content || ''}
                </Markup>
                {showAttachments ? (
                    <Attachments
                        asset={post.metadata.content?.asset}
                        attachments={post.metadata.content?.attachments ?? []}
                        isQuote
                    />
                ) : null}
            </div>
        );
    }

    return (
        <div className={'my-2 break-words pl-[52px] text-base text-main'} ref={ref}>
            <MaskRuntime>
                <DecryptPost raw={post.metadata.content?.content || ''}>
                    <Markup
                        className={classNames({ 'line-clamp-5': canShowMore }, 'markup linkify text-md break-words')}
                    >
                        {post.metadata.content?.content || ''}
                    </Markup>
                </DecryptPost>
            </MaskRuntime>

            {canShowMore ? (
                <div className="text-base font-bold text-link">
                    <div
                        onClick={(event) => {
                            router.push(urlcat('/detail/:platform/:id', { platform: post.source, id: post.postId }));
                        }}
                    >
                        <Trans>Show More</Trans>
                    </div>
                </div>
            ) : null}
            {showAttachments ? (
                <Attachments
                    post={post}
                    asset={post.metadata.content?.asset}
                    attachments={post.metadata.content?.attachments ?? []}
                />
            ) : null}
            {post.metadata.content?.oembedUrl ? <Oembed url={post.metadata.content.oembedUrl} /> : null}
            {!!post.quoteOn && !isQuote ? <Quote post={post.quoteOn} /> : null}
        </div>
    );
});
