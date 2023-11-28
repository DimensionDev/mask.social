import { Message } from '@farcaster/hub-web';
import { i18n } from '@lingui/core';
import { createPageable, type Pageable, type PageIndicator } from '@masknet/shared-base';
import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import dayjs from 'dayjs';
import { blake3 } from 'hash-wasm';
import { first } from 'lodash-es';
import urlcat from 'urlcat';
import { toBytes } from 'viem';

import { SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST, FIREFLY_HUBBLE_URL, FIREFLY_ROOT_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { getResourceType } from '@/helpers/getResourceType.js';
import {
    FarcasterNetwork,
    HashScheme,
    MessageData,
    MessageType,
    ReactionType,
    SignatureScheme,
} from '@/providers/firefly/proto/message.js';
import { FireflySession } from '@/providers/firefly/Session.js';
import type { CastResponse, CastsResponse, UserResponse, UsersResponse } from '@/providers/types/Firefly.js';
import { type Post, type Profile, ProfileStatus, type Provider, Type } from '@/providers/types/SocialMedia.js';
import { ReactionType as ReactionTypeCustom } from '@/providers/types/SocialMedia.js';
import { WarpcastSocialMediaProvider } from '@/providers/warpcast/SocialMedia.js';
import type { MetadataAsset } from '@/types/index.js';

ed.etc.sha512Sync = (...m: any) => sha512(ed.etc.concatBytes(...m));

// @ts-ignore
export class FireflySocialMedia implements Provider {
    get type() {
        return Type.Firefly;
    }

    async createSession(setUrlOrSignal?: AbortSignal | ((url: string) => void), signal?: AbortSignal) {
        return WarpcastSocialMediaProvider.createSession(setUrlOrSignal, signal);
    }

    async resumeSession(): Promise<FireflySession | null> {
        return WarpcastSocialMediaProvider.resumeSession();
    }

    async discoverPosts(indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    async getPostById(postId: string): Promise<Post> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/cast', { hash: postId });
        const { data: cast } = await fetchJSON<CastResponse>(url, {
            method: 'GET',
        });

        const asset = first(cast.embeds);
        return {
            source: SocialPlatform.Farcaster,
            postId: cast.hash,
            parentPostId: cast.parent_hash,
            timestamp: cast.timestamp ? dayjs(cast.timestamp).valueOf() : undefined,
            author: {
                profileId: cast.author.fid,
                nickname: cast.author.username,
                displayName: cast.author.display_name,
                pfp: cast.author.pfp,
                followerCount: cast.author.followers,
                followingCount: cast.author.following,
                status: ProfileStatus.Active,
                verified: true,
                source: SocialPlatform.Farcaster,
            },
            metadata: {
                locale: '',
                content: {
                    content: cast.text,
                    asset: asset
                        ? ({
                              uri: asset.url,
                              type: getResourceType(asset.url),
                          } as MetadataAsset)
                        : undefined,
                },
            },
            stats: {
                comments: cast.replyCount,
                mirrors: cast.recastCount,
                quotes: cast.recastCount,
                reactions: cast.likeCount,
            },
        };
    }

    async getProfileById(profileId: string) {
        const url = urlcat(FIREFLY_ROOT_URL, '/user', { fid: profileId });
        const { data: user } = await fetchJSON<UserResponse>(url, {
            method: 'GET',
        });

        return {
            profileId: user.fid.toString(),
            nickname: user.username,
            displayName: user.display_name,
            pfp: user.pfp,
            followerCount: user.followers,
            followingCount: user.following,
            status: ProfileStatus.Active,
            verified: true,
            source: SocialPlatform.Farcaster,
        };
    }

    async getPostsByParentPostId(postId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    async getFollowers(profileId: string, indicator?: PageIndicator) {
        const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/followers', {
            fid: profileId,
            size: 10,
            cursor: indicator?.id,
        });
        const {
            data: { list, next_cursor },
        } = await fetchJSON<UsersResponse>(url, {
            method: 'GET',
        });
        const data = list.map((user) => ({
            profileId: user.fid.toString(),
            nickname: user.username,
            displayName: user.display_name,
            pfp: user.pfp,
            followerCount: user.followers,
            followingCount: user.following,
            status: ProfileStatus.Active,
            verified: true,
            source: SocialPlatform.Farcaster,
        }));

        return createPageable(data, indicator?.id, next_cursor);
    }

    async getFollowings(profileId: string, indicator?: PageIndicator) {
        const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/followings', {
            fid: profileId,
            size: 10,
            cursor: indicator?.id,
        });
        const {
            data: { list, next_cursor },
        } = await fetchJSON<UsersResponse>(url, {
            method: 'GET',
        });
        const data = list.map((user) => ({
            profileId: user.fid.toString(),
            nickname: user.username,
            displayName: user.display_name,
            pfp: user.pfp,
            followerCount: user.followers,
            followingCount: user.following,
            status: ProfileStatus.Active,
            verified: true,
            source: SocialPlatform.Farcaster,
        }));

        return createPageable(data, indicator?.id, next_cursor);
    }

    async getPostsByProfileId(profileId: string, indicator?: PageIndicator) {
        const url = urlcat(FIREFLY_ROOT_URL, '/v2/user/timeline/farcaster', {
            fids: [profileId],
            size: 10,
            cursor: indicator?.id,
        });
        const {
            data: { casts, cursor },
        } = await fetchJSON<CastsResponse>(url, {
            method: 'GET',
        });
        const data = casts.map((cast) => ({
            source: SocialPlatform.Farcaster,
            postId: cast.hash,
            parentPostId: cast.parent_hash,
            timestamp: Number(cast.created_at),
            author: {
                profileId: cast.author.fid,
                nickname: cast.author.username,
                displayName: cast.author.display_name,
                pfp: cast.author.pfp,
                followerCount: cast.author.followers,
                followingCount: cast.author.following,
                status: ProfileStatus.Active,
                verified: true,
                source: SocialPlatform.Farcaster,
            },
            metadata: {
                locale: '',
                content: {
                    content: cast.text,
                },
            },
            stats: {
                comments: cast.replyCount,
                mirrors: cast.recastCount,
                quotes: cast.recastCount,
                reactions: cast.likeCount,
            },
        }));
        return createPageable(data, indicator?.id, cursor);
    }

    async publishPost(post: Post): Promise<Post> {
        const session = await this.resumeSession();
        if (!session) throw new Error('No session found');
        const url = urlcat(FIREFLY_HUBBLE_URL, '/v1/submitMessage');
        const messageData: MessageData = {
            type: MessageType.CAST_ADD,
            fid: Number(session.profileId),
            timestamp: Math.floor(Date.now() / 1000),
            network: FarcasterNetwork.MAINNET,
            castAddBody: {
                embedsDeprecated: EMPTY_LIST,
                mentions: EMPTY_LIST,
                text: post.metadata.content?.content ?? '',
                mentionsPositions: [],
                embeds: post.mediaObjects?.map((v) => ({ url: v.url })) ?? EMPTY_LIST,
            },
        };

        const encodedData = MessageData.encode(messageData).finish();

        const messageHash = await blake3(encodedData);

        const signature = await ed.signAsync(encodedData, toBytes(session.token));

        const message = {
            data: messageData,
            hash: toBytes(messageHash),
            hashScheme: HashScheme.BLAKE3,
            signature,
            signatureScheme: SignatureScheme.ED25519,
            signer: ed.getPublicKey(toBytes(session.token)),
        };

        const messageBytes = Buffer.from(Message.encode(message).finish());

        const { data, hash } = await fetchJSON<Message>(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: messageBytes,
        });
        if (!data) throw new Error(i18n.t('Failed to publish post'));
        return {
            source: SocialPlatform.Farcaster,
            postId: hash.toString(),
            parentPostId: '',
            timestamp: data.timestamp,
            author: {
                profileId: data?.fid.toString(),
                nickname: '',
                displayName: '',
                pfp: '',
                followerCount: 0,
                followingCount: 0,
                status: ProfileStatus.Active,
                verified: true,
                source: SocialPlatform.Farcaster,
            },
            metadata: {
                locale: '',
                content: {
                    content: data.castAddBody?.text || '',
                },
            },
            stats: {
                comments: 0,
                mirrors: 0,
                quotes: 0,
                reactions: 0,
            },
        };
    }

    async upvotePost(postId: string) {
        const session = await this.resumeSession();
        if (!session) throw new Error(i18n.t('No session found'));
        const url = urlcat(FIREFLY_HUBBLE_URL, '/v1/submitMessage');
        const messageData: MessageData = {
            type: MessageType.REACTION_ADD,
            fid: Number(session.profileId),
            timestamp: Math.floor(Date.now() / 1000),
            network: FarcasterNetwork.MAINNET,
            reactionBody: {
                type: ReactionType.LIKE,
                targetCastId: {
                    hash: toBytes(postId),
                    fid: Number(session.profileId),
                },
            },
        };

        const encodedData = MessageData.encode(messageData).finish();
        const messageHash = await blake3(encodedData);
        const signature = await ed.signAsync(encodedData, toBytes(session.token));

        const message = {
            data: messageData,
            hash: toBytes(messageHash),
            hashScheme: HashScheme.BLAKE3,
            signature,
            signatureScheme: SignatureScheme.ED25519,
            signer: ed.getPublicKey(toBytes(session.token)),
        };

        const messageBytes = Buffer.from(Message.encode(message).finish());

        const { data, hash } = await fetchJSON<Message>(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: messageBytes,
        });
        if (!data) throw new Error(i18n.t('Failed to upvote post'));

        return {
            reactionId: messageHash,
            type: ReactionTypeCustom.Upvote,
            timestamp: messageData.timestamp,
        };
    }

    async unvotePost(postId: string) {
        const session = await this.resumeSession();
        if (!session) throw new Error(i18n.t('No session found'));
        const url = urlcat(FIREFLY_HUBBLE_URL, '/v1/submitMessage');
        const messageData: MessageData = {
            type: MessageType.REACTION_REMOVE,
            fid: Number(session.profileId),
            timestamp: Math.floor(Date.now() / 1000),
            network: FarcasterNetwork.MAINNET,
            reactionBody: {
                type: ReactionType.LIKE,
                targetCastId: {
                    hash: toBytes(postId),
                    fid: Number(session.profileId),
                },
            },
        };

        const encodedData = MessageData.encode(messageData).finish();
        const messageHash = await blake3(encodedData);
        const signature = await ed.signAsync(encodedData, toBytes(session.token));

        const message = {
            data: messageData,
            hash: toBytes(messageHash),
            hashScheme: HashScheme.BLAKE3,
            signature,
            signatureScheme: SignatureScheme.ED25519,
            signer: ed.getPublicKey(toBytes(session.token)),
        };

        const messageBytes = Buffer.from(Message.encode(message).finish());

        const { data, hash } = await fetchJSON<Message>(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: messageBytes,
        });
        if (!data) throw new Error(i18n.t('Failed to unvote post'));
        return;
    }

    async commentPost(postId: string, comment: string) {
        const session = await this.resumeSession();
        if (!session) throw new Error(i18n.t('No session found'));
        const url = urlcat(FIREFLY_HUBBLE_URL, '/v1/submitMessage');
        const messageData: MessageData = {
            type: MessageType.CAST_ADD,
            fid: Number(session.profileId),
            timestamp: Math.floor(Date.now() / 1000),
            network: FarcasterNetwork.MAINNET,
            castAddBody: {
                parentCastId: {
                    hash: toBytes(postId),
                    fid: Number(session.profileId),
                },
                embedsDeprecated: EMPTY_LIST,
                mentions: EMPTY_LIST,
                text: comment,
                mentionsPositions: [],
                embeds: EMPTY_LIST,
            },
        };

        const encodedData = MessageData.encode(messageData).finish();
        const messageHash = await blake3(encodedData);
        const signature = await ed.signAsync(encodedData, toBytes(session.token));

        const message = {
            data: messageData,
            hash: toBytes(messageHash),
            hashScheme: HashScheme.BLAKE3,
            signature,
            signatureScheme: SignatureScheme.ED25519,
            signer: ed.getPublicKey(toBytes(session.token)),
        };

        const messageBytes = Buffer.from(Message.encode(message).finish());

        const { data, hash } = await fetchJSON<Message>(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: messageBytes,
        });
        if (!data) throw new Error(i18n.t('Failed to publish post'));
        return;
    }

    async unmirrorPost(postId: string) {
        const session = await this.resumeSession();
        if (!session) throw new Error(i18n.t('No session found'));
        const url = urlcat(FIREFLY_HUBBLE_URL, '/v1/submitMessage');
        const messageData: MessageData = {
            type: MessageType.REACTION_REMOVE,
            fid: Number(session.profileId),
            timestamp: Math.floor(Date.now() / 1000),
            network: FarcasterNetwork.MAINNET,
            reactionBody: {
                type: ReactionType.RECAST,
                targetCastId: {
                    hash: toBytes(postId),
                    fid: Number(session.profileId),
                },
            },
        };

        const encodedData = MessageData.encode(messageData).finish();
        const messageHash = await blake3(encodedData);
        const signature = await ed.signAsync(encodedData, toBytes(session.token));

        const message = {
            data: messageData,
            hash: toBytes(messageHash),
            hashScheme: HashScheme.BLAKE3,
            signature,
            signatureScheme: SignatureScheme.ED25519,
            signer: ed.getPublicKey(toBytes(session.token)),
        };

        const messageBytes = Buffer.from(Message.encode(message).finish());

        const { data, hash } = await fetchJSON<Message>(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: messageBytes,
        });
        if (!data) throw new Error(i18n.t('Failed to unmirror post'));
        return null!;
    }

    async mirrorPost(postId: string) {
        const session = await this.resumeSession();
        if (!session) throw new Error(i18n.t('No session found'));
        const url = urlcat(FIREFLY_HUBBLE_URL, '/v1/submitMessage');
        const messageData: MessageData = {
            type: MessageType.REACTION_ADD,
            fid: Number(session.profileId),
            timestamp: Math.floor(Date.now() / 1000),
            network: FarcasterNetwork.MAINNET,
            reactionBody: {
                type: ReactionType.RECAST,
                targetCastId: {
                    hash: toBytes(postId),
                    fid: Number(session.profileId),
                },
            },
        };

        const encodedData = MessageData.encode(messageData).finish();
        const messageHash = await blake3(encodedData);
        const signature = await ed.signAsync(encodedData, toBytes(session.token));

        const message = {
            data: messageData,
            hash: toBytes(messageHash),
            hashScheme: HashScheme.BLAKE3,
            signature,
            signatureScheme: SignatureScheme.ED25519,
            signer: ed.getPublicKey(toBytes(session.token)),
        };

        const messageBytes = Buffer.from(Message.encode(message).finish());

        const { data, hash } = await fetchJSON<Message>(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: messageBytes,
        });
        if (!data) throw new Error(i18n.t('Failed to mirror post'));
        return null!;
    }

    async followProfile(profileId: string) {
        const session = await this.resumeSession();
        if (!session) throw new Error(i18n.t('No session found'));
        const url = urlcat(FIREFLY_HUBBLE_URL, '/v1/submitMessage');
        const messageData: MessageData = {
            type: MessageType.LINK_ADD,
            fid: Number(session.profileId),
            timestamp: Math.floor(Date.now() / 1000),
            network: FarcasterNetwork.MAINNET,
            linkBody: {
                type: '1',
                targetFid: Number(profileId),
            },
        };

        const encodedData = MessageData.encode(messageData).finish();
        const messageHash = await blake3(encodedData);
        const signature = await ed.signAsync(encodedData, toBytes(session.token));

        const message = {
            data: messageData,
            hash: toBytes(messageHash),
            hashScheme: HashScheme.BLAKE3,
            signature,
            signatureScheme: SignatureScheme.ED25519,
            signer: ed.getPublicKey(toBytes(session.token)),
        };

        const messageBytes = Buffer.from(Message.encode(message).finish());

        const { data, hash } = await fetchJSON<Message>(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: messageBytes,
        });
        if (!data) throw new Error(i18n.t('Failed to follow'));
        return null!;
    }

    async unfollowProfile(profileId: string) {
        const session = await this.resumeSession();
        if (!session) throw new Error(i18n.t('No session found'));
        const url = urlcat(FIREFLY_HUBBLE_URL, '/v1/submitMessage');
        const messageData: MessageData = {
            type: MessageType.LINK_REMOVE,
            fid: Number(session.profileId),
            timestamp: Math.floor(Date.now() / 1000),
            network: FarcasterNetwork.MAINNET,
            linkBody: {
                type: '1',
                targetFid: Number(profileId),
            },
        };

        const encodedData = MessageData.encode(messageData).finish();
        const messageHash = await blake3(encodedData);
        const signature = await ed.signAsync(encodedData, toBytes(session.token));

        const message = {
            data: messageData,
            hash: toBytes(messageHash),
            hashScheme: HashScheme.BLAKE3,
            signature,
            signatureScheme: SignatureScheme.ED25519,
            signer: ed.getPublicKey(toBytes(session.token)),
        };

        const messageBytes = Buffer.from(Message.encode(message).finish());

        const { data, hash } = await fetchJSON<Message>(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: messageBytes,
        });
        if (!data) throw new Error(i18n.t('Failed to unfollow'));
        return null!;
    }

    searchProfiles(q: string, indicator?: PageIndicator): Promise<Pageable<Profile>> {
        throw new Error(i18n.t('Method not implemented.'));
    }

    searchPosts(q: string, indicator?: PageIndicator): Promise<Pageable<Post>> {
        throw new Error(i18n.t('Method not implemented.'));
    }
}

export const FireflySocialMediaProvider = new FireflySocialMedia();
