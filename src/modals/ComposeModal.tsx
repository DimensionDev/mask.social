'use client';

import { Dialog } from '@headlessui/react';
import { HashtagNode } from '@lexical/hashtag';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { LexicalComposer } from '@lexical/react/LexicalComposer.js';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext.js';
import { t, Trans } from '@lingui/macro';
import { encrypt, SteganographyPreset } from '@masknet/encryption';
import { ProfileIdentifier, type SingletonModalRefCreator } from '@masknet/shared-base';
import { useSingletonModal } from '@masknet/shared-base-ui';
import type { TypedMessageTextV1 } from '@masknet/typed-message';
import type { FireflyRedPacketAPI } from '@masknet/web3-providers/types';
import { $getRoot } from 'lexical';
import { forwardRef, useCallback } from 'react';
import { useAsync } from 'react-use';
import { None } from 'ts-results-es';
import urlcat from 'urlcat';

import CloseIcon from '@/assets/close.svg';
import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { ComposeAction } from '@/components/Compose/ComposeAction.js';
import { ComposeContent } from '@/components/Compose/ComposeContent.js';
import { ComposeSend } from '@/components/Compose/ComposeSend/index.js';
import { useSetEditorContent } from '@/components/Compose/useSetEditorContent.js';
import { MentionNode } from '@/components/Lexical/nodes/MentionsNode.js';
import { Modal } from '@/components/Modal.js';
import { Tooltip } from '@/components/Tooltip.js';
import { SocialPlatform } from '@/constants/enum.js';
import { SITE_HOSTNAME, SITE_URL } from '@/constants/index.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { fetchImageAsPNG } from '@/helpers/fetchImageAsPNG.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { hasRedPacketPayload } from '@/helpers/hasRedPacketPayload.js';
import { type Chars, readChars } from '@/helpers/readChars.js';
import { throws } from '@/helpers/throws.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { ComposeModalRef, ConfirmModalRef } from '@/modals/controls.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { steganographyEncodeImage } from '@/services/steganography.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useFarcasterStateStore, useLensStateStore } from '@/store/useProfileStore.js';

const initialConfig = {
    namespace: 'composer',
    theme: {
        link: 'text-link',
        hashtag: 'text-link',
        mention: 'text-link',
    },
    nodes: [MentionNode, HashtagNode, AutoLinkNode, LinkNode],
    editorState: null,
    onError: () => {},
};

export interface ComposeModalProps {
    type?: 'compose' | 'quote' | 'reply';
    chars?: Chars;
    source?: SocialPlatform;
    post?: Post | null;
    typedMessage?: TypedMessageTextV1 | null;
    redPacketPayload?: {
        payloadImage: string;
        claimRequirements: FireflyRedPacketAPI.StrategyPayload[];
    };
}
export type ComposeModalCloseProps = {
    disableClear?: boolean;
} | void;

export const ComposeModalUI = forwardRef<SingletonModalRefCreator<ComposeModalProps, ComposeModalCloseProps>>(
    function Compose(_, ref) {
        const isMedium = useIsMedium();
        const currentSource = useGlobalState.use.currentSource();

        const currentLensProfile = useLensStateStore.use.currentProfile();
        const currentFarcasterProfile = useFarcasterStateStore.use.currentProfile();

        const profile = useCurrentProfile(currentSource);
        const {
            loading,
            type,
            chars,
            typedMessage,
            addImage,
            updateType,
            updateCurrentSource,
            updateSources,
            updatePost,
            updateChars,
            updateTypedMessage,
            updateRedPacketPayload: updateRedPacketPayload,
            clear,
            redPacketPayload,
        } = useComposeStateStore();

        const [editor] = useLexicalComposerContext();

        const setEditorContent = useSetEditorContent();
        const [open, dispatch] = useSingletonModal(ref, {
            onOpen: (props) => {
                updateType(props.type || 'compose');
                if (props.source) {
                    updateCurrentSource(props.source);
                    updateSources([props.source]);
                }
                if (props.typedMessage) updateTypedMessage(props.typedMessage);
                if (props.post) updatePost(props.post);
                if (props.chars && typeof props.chars === 'string') {
                    updateChars(props.chars);
                    setEditorContent(props.chars);
                }
                if (props.redPacketPayload) updateRedPacketPayload(props.redPacketPayload);
            },
            onClose: (props) => {
                if (!props?.disableClear) {
                    clear();
                    editor.update(() => {
                        const root = $getRoot();
                        root.clear();
                    });
                }
            },
        });

        const onClose = useCallback(async () => {
            if (readChars(chars, true).length) {
                const confirmed = await ConfirmModalRef.openAndWaitForClose({
                    title: t`Discard`,
                    content: (
                        <div className=" text-main">
                            <Trans>This can’t be undone and you’ll lose your draft.</Trans>
                        </div>
                    ),
                });

                if (confirmed) ComposeModalRef.close();
            } else {
                dispatch?.close();
            }
        }, [chars, dispatch]);

        const { loading: encryptRedPacketLoading } = useAsync(async () => {
            if (!typedMessage) return;
            if (!hasRedPacketPayload(typedMessage)) return;

            try {
                const encrypted = await encrypt(
                    {
                        author: ProfileIdentifier.of(SITE_HOSTNAME, profile?.handle),
                        authorPublicKey: None,
                        message: typedMessage,
                        network: SITE_HOSTNAME,
                        target: { type: 'public' },
                        version: -37,
                    },
                    { deriveAESKey: throws, encryptByLocalKey: throws },
                );
                if (typeof encrypted.output === 'string') throw new Error('Expected binary data.');
                if (!redPacketPayload?.payloadImage) return;

                const secretImage = await steganographyEncodeImage(
                    await fetchImageAsPNG(redPacketPayload.payloadImage),
                    encrypted.output,
                    SteganographyPreset.Preset2023_Firefly,
                );

                const lensProfileLink = currentLensProfile ? getProfileUrl(currentLensProfile) : null;
                const farcasterProfileLink = currentFarcasterProfile ? getProfileUrl(currentFarcasterProfile) : null;

                const message = t`Check out my LuckyDrop 🧧💰✨ on Firefly mobile app or ${SITE_URL} !`;

                const lensClaimMessage = lensProfileLink ? t`Claim on Lens: ${urlcat(SITE_URL, lensProfileLink)}` : '';
                const farcasterClaimMessage = farcasterProfileLink
                    ? t`Claim on Farcaster: ${urlcat(SITE_URL, farcasterProfileLink)}`
                    : '';

                const fullMessage = `${message}\n${lensClaimMessage}\n${farcasterClaimMessage}`;

                updateChars([
                    {
                        tag: 'ff_rp',
                        content: '#FireflyLuckyDrop',
                        visible: true,
                    },
                    fullMessage,
                ]);
                setEditorContent(fullMessage);

                addImage({
                    file: new File([secretImage], 'image.png', { type: 'image/png' }),
                });
            } catch (error) {
                enqueueErrorMessage(t`Failed to create image payload.`);
            }
            // each time the typedMessage changes, we need to check if it has a red packet payload
        }, [typedMessage, redPacketPayload, currentLensProfile, currentFarcasterProfile]);

        return (
            <Modal open={open} onClose={onClose}>
                <div className="relative h-[100vh] w-[100vw] bg-bgModal shadow-popover transition-all dark:text-gray-950 md:h-auto md:w-[600px] md:rounded-xl">
                    {/* Loading */}
                    {loading || encryptRedPacketLoading ? (
                        <div className=" absolute bottom-0 left-0 right-0 top-0 z-50 flex items-center justify-center">
                            <LoadingIcon className="animate-spin" width={24} height={24} />
                        </div>
                    ) : null}

                    {/* Title */}
                    <Dialog.Title as="h3" className=" relative h-14 pt-safe">
                        <ClickableButton
                            className="absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer text-main"
                            onClick={onClose}
                        >
                            <Tooltip content={t`Close`} placement="top">
                                <CloseIcon width={24} height={24} />
                            </Tooltip>
                        </ClickableButton>

                        <span className=" flex h-full w-full items-center justify-center text-lg font-bold capitalize text-main">
                            {type === 'compose' ? (
                                <Trans>Compose</Trans>
                            ) : type === 'quote' ? (
                                <Trans>Quote</Trans>
                            ) : type === 'reply' ? (
                                <Trans>Reply</Trans>
                            ) : null}
                        </span>

                        {isMedium ? null : <ComposeSend />}
                    </Dialog.Title>

                    <ComposeContent />
                    <ComposeAction />

                    {isMedium ? <ComposeSend /> : null}
                </div>
            </Modal>
        );
    },
);

export const ComposeModal = forwardRef<SingletonModalRefCreator<ComposeModalProps, ComposeModalCloseProps>>(
    function ComposeModal(props, ref) {
        return (
            <LexicalComposer initialConfig={initialConfig}>
                <ComposeModalUI {...props} ref={ref} />
            </LexicalComposer>
        );
    },
);
