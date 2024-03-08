/* eslint-disable @next/next/no-img-element */

import { compact, first } from 'lodash-es';

import { PostContainer } from '@/components/Post/PostContainer.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { SourceIcon } from '@/components/SourceIcon.jsx';

interface PostProps {
    post: Post;
}

export function Post({ post }: PostProps) {
    const firstImageAttachmentUrl = first(
        compact(post.metadata.content?.attachments?.map((x) => (x.type === 'Image' ? x.uri : x.coverUri))),
    );

    if (!firstImageAttachmentUrl) return null;

    return (
        <PostContainer>
            <div className=" flex flex-row">
                <div className=" flex-1">
                    <div className=" flex flex-row">
                        <img src={post.author.pfp} />
                        <div className=" flex">
                            <p>{post.author.displayName}</p>
                            <p>
                                <span>{post.author.handle}</span>
                                <span>•</span>
                                <span>{post.timestamp}</span>
                            </p>
                        </div>
                    </div>
                </div>
                <div className=" w-[40px]">
                    <SourceIcon source={post.source} size={40} />
                </div>
            </div>
            <div className=" flex flex-row">
                {post.metadata.content?.content ? (
                    <div className=" flex-1">
                        <p>{post.metadata.content?.content}</p>
                    </div>
                ) : null}
                <div className=" flex-1">
                    <img src={firstImageAttachmentUrl} />
                </div>
            </div>
        </PostContainer>
    );
}
