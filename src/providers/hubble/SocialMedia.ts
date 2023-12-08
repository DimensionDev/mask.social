import { Message } from '@farcaster/hub-web';
import { t } from '@lingui/macro';
import { type Pageable, type PageIndicator } from '@masknet/shared-base';
import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import { blake3 } from 'hash-wasm';
import urlcat from 'urlcat';
import { toBytes } from 'viem';

import { SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST, FIREFLY_HUBBLE_URL, FIREFLY_ROOT_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import {
    FarcasterNetwork,
    HashScheme,
    MessageData,
    MessageType,
    ReactionType,
    SignatureScheme,
} from '@/providers/firefly/proto/message.js';
import type { UserResponse } from '@/providers/types/Firefly.js';
import { type Post, type Profile, ProfileStatus, type Provider, Type } from '@/providers/types/SocialMedia.js';
import { ReactionType as ReactionTypeCustom } from '@/providers/types/SocialMedia.js';
import type { WarpcastSession } from '@/providers/warpcast/Session.js';
import { WarpcastSocialMediaProvider } from '@/providers/warpcast/SocialMedia.js';

ed.etc.sha512Sync = (...m: any) => sha512(ed.etc.concatBytes(...m));

// @ts-ignore
export class HubbleSocialMedia implements Provider {
    get type() {
        return Type.Firefly;
    }

    async createSession(signal?: AbortSignal): Promise<WarpcastSession> {
        throw new Error('Please use createSessionByGrantPermission() instead.');
    }

    async createSessionByCustodyWallet(signal?: AbortSignal) {
        return WarpcastSocialMediaProvider.createSessionByGustodyWallet(signal);
    }

    async createSessionByGrantPermission(setUrl: (url: string) => void, signal?: AbortSignal) {
        return WarpcastSocialMediaProvider.createSessionByGrantPermission(setUrl, signal);
    }

    async resumeSession() {
        return WarpcastSocialMediaProvider.resumeSession();
    }

    async discoverPosts(indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    async getPostById(postId: string): Promise<Post> {
        throw new Error('Method not implemented.');
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

    async getFollowers(profileId: string, indicator?: PageIndicator): Promise<Pageable<Profile>> {
        throw new Error('Method not implemented.');
    }

    async getFollowings(profileId: string, indicator?: PageIndicator): Promise<Pageable<Profile>> {
        throw new Error('Method not implemented.');
    }

    async getPostsByProfileId(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post>> {
        throw new Error('Method not implemented.');
    }

    async publishPost(post: Post): Promise<Post> {
        const session = await this.resumeSession();
        if (!session) throw new Error(t`No session found`);

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
                mentionsPositions: EMPTY_LIST,
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
        if (!data) throw new Error(t`Failed to publish post`);

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
        if (!session) throw new Error(t`No session found`);
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
        if (!data) throw new Error(t`Failed to upvote post`);

        return {
            reactionId: messageHash,
            type: ReactionTypeCustom.Upvote,
            timestamp: messageData.timestamp,
        };
    }

    async unvotePost(postId: string) {
        const session = await this.resumeSession();
        if (!session) throw new Error(t`No session found`);
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
        if (!data) throw new Error(t`Failed to unvote post`);
        return;
    }

    async commentPost(postId: string, comment: string) {
        const session = await this.resumeSession();
        if (!session) throw new Error(t`No session found`);
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
                mentionsPositions: EMPTY_LIST,
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
        if (!data) throw new Error(t`Failed to publish post`);
        return;
    }

    async mirrorPost(postId: string) {
        const session = await this.resumeSession();
        if (!session) throw new Error(t`No session found`);
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
        if (!data) throw new Error(t`Failed to mirror post`);
        return null!;
    }

    async unmirrorPost(postId: string) {
        const session = await this.resumeSession();
        if (!session) throw new Error(t`No session found`);
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
        if (!data) throw new Error(t`Failed to unmirror post`);
        return null!;
    }

    async follow(profileId: string) {
        const session = await this.resumeSession();
        if (!session) throw new Error(t`No session found`);
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
        if (!data) throw new Error(t`Failed to follow`);
        return null!;
    }

    async unfollow(profileId: string) {
        const session = await this.resumeSession();
        if (!session) throw new Error(t`No session found`);
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
        if (!data) throw new Error(t`Failed to unfollow`);
        return null!;
    }

    searchProfiles(q: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        throw new Error(t`Method not implemented.`);
    }

    searchPosts(q: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error(t`Method not implemented.`);
    }
}

export const HubbleSocialMediaProvider = new HubbleSocialMedia();
