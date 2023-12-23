import type { Pageable, PageIndicator } from '@masknet/shared-base';

import type { SocialPlatform } from '@/constants/enum.js';
import type { Session } from '@/providers/types/Session.js';
import type { MetadataAsset } from '@/types/index.js';

export enum SessionType {
    Twitter = 'Twitter',
    Lens = 'Lens',
    Farcaster = 'Farcaster',
}

export enum MimeType {
    AUDIO_WAV = 'audio/wav',
    AUDIO_MPEG = 'audio/mpeg',
    AUDIO_OGG = 'audio/ogg',
    AUDIO_MP4 = 'audio/mp4',
    AUDIO_AAC = 'audio/aac',
    AUDIO_WEBM = 'audio/webm',
    AUDIO_FLAC = 'audio/flac',

    VIDEO_WEBM = 'video/webm',
    VIDEO_MP4 = 'video/mp4',
    VIDEO_M4V = 'video/x-m4v',
    VIDEO_OGV = 'video/ogv',
    VIDEO_QUICKTIME = 'video/quicktime',
    VIDEO_MPEG = 'video/mpeg',
    VIDEO_OGG = 'video/ogg',

    IMAGE_GIF = 'image/gif',
    IMAGE_JPEG = 'image/jpeg',
    IMAGE_PNG = 'image/png',
    IMAGE_TIFF = 'image/tiff',
    IMAGE_BMP = 'image/x-ms-bmp',
    IMAGE_SVG = 'image/svg+xml',
    IMAGE_WEBP = 'image/webp',
}

export enum NetworkType {
    Ethereum = 'Ethereum',
}

export enum ReactionType {
    Upvote = 'Upvote', // aka. like
}

export enum NotificationType {
    Reaction = 'reaction',
    Comment = 'comment',
    Mirror = 'mirror',
    Quote = 'quote',
    Follow = 'follow',
    Mention = 'mention',
    Act = 'act',
}

export enum ProfileStatus {
    Active = 'active',
    Inactive = 'inactive',
}

export interface Reaction {
    reactionId: string;
    type: ReactionType;
    timestamp: number;
}

export interface Tag {
    tagId: string;
    label: string;
}

export interface Profile {
    profileId: string;
    displayName: string;
    handle: string;
    fullHandle: string;
    pfp: string;
    bio?: string;
    address?: string;
    followerCount: number;
    followingCount: number;
    status: ProfileStatus;
    tags?: Tag[];
    verified: boolean;
    signless?: boolean;
    viewerContext?: {
        following: boolean;
        followedBy: boolean;
    };
    ownedBy?: {
        networkType: NetworkType;
        address: string;
    };
    __original__?: unknown;
    source: SocialPlatform;
}

export interface MediaObject {
    title?: string;
    url: string;
    mimeType: string;
}

export interface Attachment {
    uri?: string;
    coverUri?: string;
    artist?: string | null;
    type: 'Image' | 'Video' | 'Audio';
}

export type PostType = 'Post' | 'Comment' | 'Quote' | 'Mirror';

export interface Post {
    type?: PostType;
    /** It's `hash` for Farcaster */
    postId: string;
    parentPostId?: string;
    parentAuthor?: Profile;
    timestamp?: number;
    author: Profile;
    mediaObjects?: MediaObject[];
    permalink?: string;
    parentPermalink?: string;
    isHidden?: boolean;
    isEncrypted?: boolean;
    isEncryptedByMask?: boolean;
    metadata: {
        locale: string;
        description?: string;
        content: {
            content?: string;
            asset?: MetadataAsset;
            attachments?: Attachment[];
            oembedUrl?: string;
        } | null;
        contentURI?: string;
    };
    stats?: {
        comments: number;
        mirrors: number;
        quotes?: number;
        reactions: number;
        bookmarks?: number;
        countOpenActions?: number;
    };
    mirrors?: Profile[];
    reactions?: Profile[];
    canComment?: boolean;
    canMirror?: boolean;
    canAct?: boolean;
    mentions?: Profile[];
    hasMirrored?: boolean;
    hasLiked?: boolean;
    hasActed?: boolean;
    __original__?: unknown;
    source: SocialPlatform;

    /**
     * Sometimes we need to render a thread, and we currently support up to three level.
     * root
     * |
     * commentOn
     * |
     * post
     *
     * As shown above, `root` represents the start of the thread.
     * the current post itself represents the end of the thread.
     * and `commentOn` represents the post to which the current post is a reply.
     */
    commentOn?: Post;
    root?: Post;
    quoteOn?: Post;
    comments?: Post[];
    embedPosts?: Post[];
}

export interface Comment {
    commentId: string;
    timestamp: number;
    author: Profile;
    for: Post;
    profilesMentioned?: Profile[];
    hashTagsMentioned?: string[];
}

export interface Collection {
    collectionId: string;
    posts: Post[];
}

export interface BaseNotification {
    notificationId: string;
    source: SocialPlatform;
    timestamp?: number;
}

export interface MirrorNotification extends BaseNotification {
    type: NotificationType.Mirror;
    mirrors: Profile[];
    post?: Post;
}

export interface QuoteNotification extends BaseNotification {
    type: NotificationType.Quote;
    quote: Post;
    post: Post;
}

export interface ReactionNotification extends BaseNotification {
    type: NotificationType.Reaction;
    reactors: Profile[];
    post?: Post;
}

export interface CommentNotification extends BaseNotification {
    type: NotificationType.Comment;
    comment?: Post;
    post?: Post;
}

export interface FollowNotification extends BaseNotification {
    type: NotificationType.Follow;
    followers: Profile[];
}

export interface MentionNotification extends BaseNotification {
    type: NotificationType.Mention;
    post?: Post;
}

export interface ActedNotification extends BaseNotification {
    type: NotificationType.Act;
    post: Post;
    actions: Profile[];
}

export type Notification =
    | MirrorNotification
    | QuoteNotification
    | ReactionNotification
    | CommentNotification
    | FollowNotification
    | MentionNotification
    | ActedNotification;

export interface Provider {
    type: SessionType;

    /**
     * Initiates the login process for the provider.
     *
     * @param signal Optional AbortSignal for cancellation.
     * @returns A promise that resolves to an Auth object upon successful login.
     */
    createSession: (signal?: AbortSignal) => Promise<Session>;

    /**
     * Publishes a post.
     *
     * @param post The post to be published.
     * @returns A promise that resolves to a Post object.
     */
    publishPost: (post: Post) => Promise<Post>;

    /**
     * Mirrors a post with the specified post ID.
     *
     * @param postId The ID of the post to mirror.
     * @returns A promise that resolves to a Post object.
     */
    mirrorPost?: (postId: string) => Promise<Post>;

    /**
     * Quotes a post with the specified post ID and an introduction.
     *
     * @param postId The ID of the post to quote.
     * @param intro The introduction text for the quote. (Review required, not sure what the actual type is)
     * @returns A promise that resolves to a Post object.
     */
    quotePost?: (postId: string, intro: string) => Promise<Post>;

    /**
     * Collects a post with the specified post ID.
     *
     * @param postId The ID of the post to collect.
     * @param collectionId The ID of the collection to collect the post to.
     * @returns A promise that resolves to void.
     */
    collectPost?: (postId: string, collectionId?: string) => Promise<void>;

    /**
     * Comments on a post with the specified post ID and comment text.
     *
     * @param postId The ID of the post to comment on.
     * @param comment The comment text. (Review required, not sure what the actual type is)
     * @returns A promise that resolves to comment id.
     */
    commentPost?: (postId: string, comment: string) => Promise<string>;

    /**
     * Upvotes a post with the specified post ID.
     *
     * @param postId The ID of the post to upvote.
     * @returns A promise that resolves to a Reaction object.
     */
    upvotePost: (postId: string) => Promise<Reaction>;

    /**
     * Removes an upvote from a post with the specified post ID.
     *
     * @param postId The ID of the post to remove the upvote from.
     * @returns A promise that resolves to void.
     */
    unvotePost: (postId: string) => Promise<void>;

    /**
     *
     * @param address EVM address
     * @returns A promise that resolves to Profiles array by address.
     */
    getProfilesByAddress: (address: string) => Promise<Profile[]>;

    /**
     * Retrieves a user's profile by their profile ID.
     *
     * @param profileId The ID of the user's profile.
     * @returns A promise that resolves to a Profile object.
     */
    getProfileById: (profileId: string) => Promise<Profile>;

    /**
     * Retrieves a user's profile by their handle.
     *
     * @param handle The handle of the user's profile.
     * @returns
     */
    getProfileByHandle: (handle: string) => Promise<Profile>;

    /**
     * Retrieves a post by its post ID.
     *
     * @param postId The ID of the post to retrieve.
     * @returns A promise that resolves to a Post object.
     */
    getPostById: (postId: string) => Promise<Post>;

    /**
     * Retrieves comments by post ID.
     * @param postId The ID of the post to retrieve.
     * @returns A promise that resolves to Comments list.
     */
    getCommentsById: (postId: string, indicator?: PageIndicator) => Promise<Pageable<Post, PageIndicator>>;
    /**
     * Retrieves recent posts in reverse chronological order.
     *
     * @param indicator Optional PageIndicator for pagination.
     * @returns A promise that resolves to a pageable list of Post objects.
     */
    discoverPosts: (indicator?: PageIndicator) => Promise<Pageable<Post>>;

    /**
     * Retrieves recent post by a specific profile id.
     * @param profileId The ID of the profile.
     * @param indicator Optional PageIndicator for pagination.
     * @returns A promise that resolves to a pageable list of Post objects.
     */
    discoverPostsById: (profileId: string, indicator?: PageIndicator) => Promise<Pageable<Post>>;
    /**
     * Retrieves posts by a specific profile ID.
     *
     * @param profileId The ID of the profile.
     * @param indicator Optional PageIndicator for pagination.
     * @returns A promise that resolves to a pageable list of Post objects.
     */
    getPostsByProfileId: (profileId: string, indicator?: PageIndicator) => Promise<Pageable<Post>>;

    /**
     * Retrieves posts where a user is mentioned by their profile ID.
     *
     * @param profileId The ID of the user's profile.
     * @param indicator Optional PageIndicator for pagination.
     * @returns A promise that resolves to a pageable list of Post objects.
     */
    getPostsBeMentioned: (profileId: string, indicator?: PageIndicator) => Promise<Pageable<Post>>;

    /**
     * Retrieves posts that a user has liked.
     *
     * @param profileId The ID of the user's profile.
     * @param indicator Optional PageIndicator for pagination.
     * @returns A promise that resolves to a pageable list of Post objects.
     */
    getPostsLiked: (profileId: string, indicator?: PageIndicator) => Promise<Pageable<Post>>;

    /**
     * Retrieves posts that are replied by user.
     *
     * @param profileId The ID of the user's profile.
     * @param indicator Optional PageIndicator for pagination.
     * @returns A promise that resolves to a pageable list of Post objects.
     */
    getPostsReplies: (profileId: string, indicator?: PageIndicator) => Promise<Pageable<Post>>;

    /**
     * Retrieves posts with a specific parent post ID.
     *
     * @param postId The ID of the parent post.
     * @param indicator Optional PageIndicator for pagination.
     * @returns A promise that resolves to a pageable list of Post objects.
     */
    getPostsByParentPostId: (postId: string, indicator?: PageIndicator) => Promise<Pageable<Post>>;

    /**
     * Retrieves reactors (users who reacted to a post) by post ID.
     *
     * @param postId The ID of the post.
     * @param indicator Optional PageIndicator for pagination.
     * @returns A promise that resolves to a pageable list of Profile objects.
     */
    getReactors: (postId: string, indicator?: PageIndicator) => Promise<Pageable<Profile>>;

    /**
     * Allows the current logged user to follow another user by specifying their profile ID.
     *
     * @param profileId The ID of the user to follow.
     * @returns A promise that resolves to void.
     */
    follow: (profileId: string) => Promise<void>;

    /**
     * Allows the current logged user to unfollow another user by specifying their profile ID.
     *
     * @param profileId The ID of the user to unfollow.
     * @returns A promise that resolves to void.
     */
    unfollow: (profileId: string) => Promise<void>;

    /**
     * Retrieves followers of a user by their profile ID.
     *
     * @param profileId The ID of the user's profile.
     * @param indicator Optional PageIndicator for pagination.
     * @returns A promise that resolves to a pageable list of Profile objects.
     */
    getFollowers: (profileId: string, indicator?: PageIndicator) => Promise<Pageable<Profile>>;

    /**
     * Retrieves users followed by a user by their profile ID.
     *
     * @param profileId The ID of the user's profile.
     * @param indicator Optional PageIndicator for pagination.
     * @returns A promise that resolves to a pageable list of Profile objects.
     */
    getFollowings: (profileId: string, indicator?: PageIndicator) => Promise<Pageable<Profile>>;

    /**
     * Checks if a user is followed by the current logged user by specifying their profile ID.
     *
     * @param profileId The ID of the user's profile to check.
     * @returns A promise that resolves to a boolean.
     */
    isFollowedByMe?: (profileId: string) => Promise<boolean>;

    /**
     * Checks if a user is following the current logged user by specifying their profile ID.
     *
     * @param profileId The ID of the user's profile to check.
     * @returns A promise that resolves to a boolean.
     */
    isFollowingMe?: (profileId: string) => Promise<boolean>;

    /**
     * Retrieves notifications.
     *
     * @param indicator Optional PageIndicator for pagination.
     * @returns A promise that resolves to a pageable list of Notification objects.
     */
    getNotifications: (indicator?: PageIndicator) => Promise<Pageable<Notification>>;

    /**
     * Retrieves suggested user profiles to follow.
     *
     * @param indicator Optional PageIndicator for pagination.
     * @returns A promise that resolves to a pageable list of Profile objects.
     */
    getSuggestedFollows: (indicator?: PageIndicator) => Promise<Pageable<Profile>>;

    /**
     * Search profiles.
     * @param indicator
     * @returns
     */
    searchProfiles: (q: string, indicator?: PageIndicator) => Promise<Pageable<Profile>>;

    /**
     * Search posts.
     * @param indicator
     * @returns
     */
    searchPosts: (q: string, indicator?: PageIndicator) => Promise<Pageable<Post>>;
}
