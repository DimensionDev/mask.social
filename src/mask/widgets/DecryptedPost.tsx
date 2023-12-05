'use client';

import { Providers } from '@/app/provider.js';
import { DecryptPost } from '@/components/Posts/DecryptPost.js';
import { getPostDetailUrl } from '@/helpers/getPostDetailUrl.js';
import { Providers as MaskProviders } from '@/mask/widgets/Providers.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface PageInspectorProps {
    post?: Post;
    payload?: [string, '1' | '2'];
    canShowMore?: boolean;
}

export default function DecryptedPost({ post, payload, canShowMore = false }: PageInspectorProps) {
    if (!post || !payload) return null;

    const postLink = getPostDetailUrl(post.postId, post.source);

    return (
        <Providers>
            <MaskProviders>
                <DecryptPost post={post} payload={payload} />
            </MaskProviders>
        </Providers>
    );
}