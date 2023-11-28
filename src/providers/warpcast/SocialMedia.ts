import { i18n } from '@lingui/core';
import {
    createIndicator,
    createNextIndicator,
    createPageable,
    type Pageable,
    type PageIndicator,
} from '@masknet/shared-base';
import { HubRestAPIClient } from '@standard-crypto/farcaster-js';
import urlcat from 'urlcat';
import { getWalletClient } from 'wagmi/actions';

import { SocialPlatform } from '@/constants/enum.js';
import { WARPCAST_ROOT_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { formatWarpcastPostFromFeed } from '@/helpers/formatWarpcastPost.js';
import { generateCustodyBearer } from '@/helpers/generateCustodyBearer.js';
import { waitForSignedKeyRequestComplete } from '@/helpers/waitForSignedKeyRequestComplete.js';
import { SessionFactory } from '@/providers/base/SessionFactory.js';
import {
    type Post,
    type Profile,
    ProfileStatus,
    type Provider,
    ReactionType,
    Type,
} from '@/providers/types/SocialMedia.js';
import type {
    CastResponse,
    FeedResponse,
    ReactionResponse,
    SuccessResponse,
    UserResponse,
    UsersResponse,
} from '@/providers/types/Warpcast.js';
import { WarpcastSession } from '@/providers/warpcast/Session.js';
import type { ResponseJSON } from '@/types/index.js';

export class WarpcastSocialMedia implements Provider {
    get type() {
        return Type.Warpcast;
    }

    /**
     * Initiates the creation of a session by granting data access permission to another FID.
     * @param signal
     * @returns
     */
    async _createSessionByGrantPermission(setUrl?: (url: string) => void, signal?: AbortSignal) {
        const response = await fetchJSON<
            ResponseJSON<{
                publicKey: string;
                privateKey: string;
                fid: string;
                token: string;
                timestamp: number;
                expiresAt: number;
                deeplinkUrl: string;
            }>
        >('/api/warpcast/signin', {
            method: 'POST',
        });
        if (!response.success) throw new Error(response.error.message);

        // present QR code to the user
        setUrl?.(response.data.deeplinkUrl);

        await waitForSignedKeyRequestComplete(signal)(response.data.token);

        return new WarpcastSession(
            response.data.fid,
            response.data.privateKey,
            response.data.timestamp,
            response.data.expiresAt,
        );
    }

    /**
     * Create a session by signing the challenge with the custody wallet
     * @param signal
     * @returns
     */
    async _createSessionByCustodyWallet(signal?: AbortSignal) {
        const client = await getWalletClient();
        if (!client) throw new Error(i18n.t('No client found'));

        const { payload, token } = await generateCustodyBearer(client);
        const response = await fetchJSON<{
            result: {
                token: {
                    secret: string;
                };
            };
            errors?: Array<{ message: string; reason: string }>;
        }>(urlcat(WARPCAST_ROOT_URL, '/auth'), {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });
        if (response.errors?.length) throw new Error(response.errors[0].message);

        const { result: user } = await fetchJSON<UserResponse>(
            urlcat(WARPCAST_ROOT_URL, '/me', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${response.result.token.secret}`,
                },
            }),
        );

        return new WarpcastSession(
            user.fid.toString(),
            response.result.token.secret,
            payload.params.timestamp,
            payload.params.expiresAt,
        );
    }

    async createSession(
        setUrlOrSignal?: AbortSignal | ((url: string) => void),
        signal?: AbortSignal,
    ): Promise<WarpcastSession> {
        const setUrl = typeof setUrlOrSignal === 'function' ? setUrlOrSignal : undefined;
        const abortSignal = setUrlOrSignal instanceof AbortSignal ? setUrlOrSignal : signal;

        const session = await this._createSessionByGrantPermission(setUrl, abortSignal);
        localStorage.setItem('warpcast_session', session.serialize());
        return session;
    }

    async resumeSession(): Promise<WarpcastSession | null> {
        const storedSession = localStorage.getItem('warpcast_session');
        if (!storedSession) return null;

        const recoveredSession = SessionFactory.createSession<WarpcastSession>(storedSession);
        if (recoveredSession.expiresAt > Date.now()) {
            return recoveredSession;
        } else {
            return null;
        }
    }

    async createClient() {
        return new HubRestAPIClient();
    }

    async discoverPosts(indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const url = urlcat('https://client.warpcast.com/v2', '/default-recommended-feed', {
            limit: 10,
            cursor: indicator?.id,
        });

        const { result, next } = await fetchJSON<FeedResponse>(url, {
            method: 'GET',
        });
        const data = result.feed.map(formatWarpcastPostFromFeed);
        return createPageable(data, indicator ?? createIndicator(), createNextIndicator(indicator, next.cursor));
    }

    async getPostById(postId: string): Promise<Post> {
        const url = urlcat(WARPCAST_ROOT_URL, '/cast', { hash: postId });
        const { result: cast } = await this.fetchWithSession<CastResponse>(url, {
            method: 'GET',
        });

        return {
            source: SocialPlatform.Farcaster,
            postId: cast.hash,
            parentPostId: cast.threadHash,
            timestamp: cast.timestamp,
            author: {
                profileId: cast.author.fid.toString(),
                nickname: cast.author.username,
                displayName: cast.author.displayName,
                pfp: cast.author.pfp.url,
                followerCount: cast.author.followerCount,
                followingCount: cast.author.followingCount,
                status: ProfileStatus.Active,
                verified: cast.author.pfp.verified,
                source: SocialPlatform.Farcaster,
            },
            metadata: {
                locale: '',
                content: {
                    content: cast.text,
                },
            },
            stats: {
                comments: cast.replies.count,
                mirrors: cast.recasts.count,
                quotes: cast.recasts.count,
                reactions: cast.reactions.count,
            },
        };
    }

    async getProfileById(profileId: string) {
        const url = urlcat(WARPCAST_ROOT_URL, '/user', { fid: profileId });
        const { result: user } = await this.fetchWithSession<UserResponse>(url, {
            method: 'GET',
        });

        return {
            profileId: user.fid.toString(),
            nickname: user.username,
            displayName: user.displayName,
            pfp: user.pfp.url,
            followerCount: user.followerCount,
            followingCount: user.followingCount,
            status: ProfileStatus.Active,
            verified: user.pfp.verified,
            viewerContext: {
                following: user.viewerContext.following,
                followedBy: user.viewerContext.followedBy,
            },
            source: SocialPlatform.Farcaster,
        };
    }

    // @ts-ignore
    async getPostsByParentPostId(
        parentPostId: string,
        username: string,
        indicator?: PageIndicator,
    ): Promise<Pageable<Post, PageIndicator>> {
        const url = urlcat('https://client.warpcast.com/v2', '/v2/user-thread-casts', {
            castHashPrefix: parentPostId,
            limit: 10,
            username,
        });
        const { result, next } = await fetchJSON<FeedResponse>(url, {
            method: 'GET',
        });
        const data = result.feed.map(formatWarpcastPostFromFeed);
        return createPageable(data, indicator ?? createIndicator(), createNextIndicator(indicator, next.cursor));
    }

    async getFollowers(profileId: string, indicator?: PageIndicator) {
        const url = urlcat(WARPCAST_ROOT_URL, '/followers', {
            fid: profileId,
            limit: 10,
            cursor: indicator?.id,
        });
        const { result, next } = await this.fetchWithSession<UsersResponse>(url, {
            method: 'GET',
        });
        const data = result.map((user) => ({
            profileId: user.fid.toString(),
            nickname: user.username,
            displayName: user.displayName,
            pfp: user.pfp.url,
            followerCount: user.followerCount,
            followingCount: user.followingCount,
            status: ProfileStatus.Active,
            verified: user.pfp.verified,
            viewerContext: {
                following: user.viewerContext.following,
                followedBy: user.viewerContext.followedBy,
            },
            source: SocialPlatform.Farcaster,
        }));

        return createPageable(data, indicator, createNextIndicator(indicator, next.cursor));
    }

    async getFollowings(profileId: string, indicator?: PageIndicator) {
        const url = urlcat(WARPCAST_ROOT_URL, '/following', {
            fid: profileId,
            limit: 10,
            cursor: indicator?.id,
        });
        const { result, next } = await this.fetchWithSession<UsersResponse>(url, {
            method: 'GET',
        });
        const data = result.map((user) => ({
            profileId: user.fid.toString(),
            nickname: user.username,
            displayName: user.displayName,
            pfp: user.pfp.url,
            followerCount: user.followerCount,
            followingCount: user.followingCount,
            status: ProfileStatus.Active,
            verified: user.pfp.verified,
            viewerContext: {
                following: user.viewerContext.following,
                followedBy: user.viewerContext.followedBy,
            },
            source: SocialPlatform.Farcaster,
        }));

        return createPageable(data, indicator, createNextIndicator(indicator, next.cursor));
    }

    async publishPost(post: Post): Promise<Post> {
        const url = urlcat(WARPCAST_ROOT_URL, '/casts');
        const { result: cast } = await this.fetchWithSession<CastResponse>(url, {
            method: 'POST',
            body: JSON.stringify({ text: post.metadata.content }),
        });

        return {
            source: SocialPlatform.Farcaster,
            postId: cast.hash,
            parentPostId: cast.threadHash,
            timestamp: cast.timestamp,
            author: {
                profileId: cast.author.fid.toString(),
                nickname: cast.author.username,
                displayName: cast.author.displayName,
                pfp: cast.author.pfp.url,
                followerCount: cast.author.followerCount,
                followingCount: cast.author.followingCount,
                status: ProfileStatus.Active,
                verified: cast.author.pfp.verified,
                source: SocialPlatform.Farcaster,
            },
            metadata: {
                locale: '',
                content: {
                    content: cast.text,
                },
            },
            stats: {
                comments: cast.replies.count,
                mirrors: cast.recasts.count,
                quotes: cast.recasts.count,
                reactions: cast.reactions.count,
            },
        };
    }

    async upvotePost(postId: string) {
        const url = urlcat(WARPCAST_ROOT_URL, '/cast-likes');
        const { result: reaction } = await this.fetchWithSession<ReactionResponse>(url, {
            method: 'POST',
            body: JSON.stringify({ castHash: postId }),
        });

        return {
            reactionId: reaction.hash,
            type: ReactionType.Upvote,
            timestamp: reaction.timestamp,
        };
    }

    async unvotePost(postId: string) {
        const url = urlcat(WARPCAST_ROOT_URL, '/cast-likes');
        await this.fetchWithSession<ReactionResponse>(url, {
            method: 'DELETE',
            body: JSON.stringify({ castHash: postId }),
        });
    }

    async commentPost(postId: string, comment: string) {
        const url = urlcat(WARPCAST_ROOT_URL, '/casts', { parent: postId });
        await this.fetchWithSession<CastResponse>(url, {
            method: 'POST',
            body: JSON.stringify({ text: comment }),
        });
    }

    async mirrorPost(postId: string) {
        const url = urlcat(WARPCAST_ROOT_URL, '/recasts');
        await this.fetchWithSession<{ result: { castHash: string } }>(url, {
            method: 'PUT',
            body: JSON.stringify({ castHash: postId }),
        });

        return null!;
    }

    async unmirrorPost(postId: string) {
        const url = urlcat(WARPCAST_ROOT_URL, '/recasts');
        const { result } = await this.fetchWithSession<SuccessResponse>(url, {
            method: 'DELETE',
            body: JSON.stringify({ castHash: postId }),
        });
        return result.success;
    }

    async followProfile(profileId: string) {
        const url = urlcat(WARPCAST_ROOT_URL, '/follows');
        await this.fetchWithSession<SuccessResponse>(url, {
            method: 'PUT',
            body: JSON.stringify({ targetFid: Number(profileId) }),
        });
    }

    async unfollow(profileId: string) {
        const url = urlcat(WARPCAST_ROOT_URL, '/follows');
        await this.fetchWithSession<SuccessResponse>(url, {
            method: 'DELETE',
            body: JSON.stringify({ targetFid: Number(profileId) }),
        });
    }

    private async fetchWithSession<T>(url: string, options: RequestInit) {
        const session = await this.resumeSession();
        if (!session) throw new Error('No session found');
        return fetchJSON<T>(url, {
            ...options,
            headers: { Authorization: `Bearer ${session.token}` },
        });
    }

    searchProfiles(q: string, indicator?: PageIndicator): Promise<Pageable<Profile>> {
        throw new Error(i18n.t('Method not implemented.'));
    }

    searchPosts(q: string, indicator?: PageIndicator): Promise<Pageable<Post>> {
        throw new Error(i18n.t('Method not implemented.'));
    }
}

export const WarpcastSocialMediaProvider = new WarpcastSocialMedia();
