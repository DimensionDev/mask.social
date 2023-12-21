import type { TypedMessageTextV1 } from '@masknet/typed-message';
import type { Dispatch, SetStateAction } from 'react';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { createSelectors } from '@/helpers/createSelector.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import type { MediaObject } from '@/types/index.js';

// A recursive version of Post will cause typescript failed to infer the type of the final exports.
type OrphanPost = Omit<Post, 'embedPosts' | 'comments' | 'root' | 'commentOn' | 'quoteOn'>;

interface ComposeState {
    type: 'compose' | 'quote' | 'reply';
    // If source is null, it means to post to all platforms.
    source: SocialPlatform | null;
    /** Parent post */
    lensPostId: string | null;
    farcasterPostId: string | null;
    post: OrphanPost | null;
    chars: string;
    typedMessage: TypedMessageTextV1 | null;
    video: MediaObject | null;
    images: MediaObject[];
    loading: boolean;
    disablePlatform: SocialPlatform | null;
    updateSource: (source: SocialPlatform | null) => void;
    updateType: (type: 'compose' | 'quote' | 'reply') => void;
    updateChars: (chars: string) => void;
    updateTypedMessage: (typedMessage: TypedMessageTextV1 | null) => void;
    updateLoading: (loading: boolean) => void;
    updatePost: (post: OrphanPost | null) => void;
    updateVideo: (video: MediaObject | null) => void;
    updateImages: Dispatch<SetStateAction<MediaObject[]>>;
    addImage: (image: MediaObject) => void;
    removeImage: (image: MediaObject) => void;
    clear: () => void;
    updateLensPostId: (postId: string | null) => void;
    updateFarcasterPostId: (postId: string | null) => void;
    updateDisablePlatform: (platform: SocialPlatform | null) => void;
}

function createInitState() {
    return {
        type: 'compose',
        source: null,
        draft: null,
        post: null,
        chars: '',
        typedMessage: null,
        images: EMPTY_LIST,
        video: null,
        loading: false,
        lensPostId: null,
        farcasterPostId: null,
        disablePlatform: null,
    } as const;
}

const useComposeStateBase = create<ComposeState, [['zustand/immer', unknown]]>(
    immer<ComposeState>((set, get) => ({
        ...createInitState(),
        updateLensPostId: (postId) =>
            set((state) => {
                state.lensPostId = postId;
            }),
        updateFarcasterPostId: (postId) =>
            set((state) => {
                state.farcasterPostId = postId;
            }),
        updateType: (type: 'compose' | 'quote' | 'reply') =>
            set((state) => {
                state.type = type;
            }),
        updateSource: (source: SocialPlatform | null) =>
            set((state) => {
                state.source = source;
            }),
        updateChars: (chars: string) =>
            set((state) => {
                state.chars = chars;
            }),
        updateTypedMessage: (typedMessage: TypedMessageTextV1 | null) =>
            set((state) => {
                return {
                    ...state,
                    typedMessage,
                };
            }),
        updateLoading: (loading) =>
            set((state) => {
                state.loading = loading;
            }),
        updateImages: (images) =>
            set((state) => {
                state.images = typeof images === 'function' ? images(state.images) : images;
            }),
        updatePost: (post: OrphanPost | null) =>
            set((state) => {
                state.post = post;
            }),
        removePost: () =>
            set((state) => {
                state.post = null;
            }),
        addImage: (image: MediaObject) =>
            set((state) => {
                state.images = [...state.images, image];
            }),
        updateVideo: (video: MediaObject | null) =>
            set((state) => {
                state.video = video;
            }),
        removeImage: (target) =>
            set((state) => {
                state.images = state.images.filter((image) => image.file !== target.file);
            }),
        updateDisablePlatform: (platform: SocialPlatform | null) =>
            set((state) => {
                state.disablePlatform = platform;
            }),
        clear: () =>
            set((state) => {
                Object.assign(state, createInitState());
            }),
    })),
);

export const useComposeStateStore = createSelectors(useComposeStateBase);
