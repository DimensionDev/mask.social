import { t, Trans } from '@lingui/macro';
import { useMemo } from 'react';
import { useAsyncFn } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';
import SendIcon from '@/assets/send.svg';
import { CountdownCircle } from '@/components/Compose/CountdownCircle.js';
import { classNames } from '@/helpers/classNames.js';
import { commentPostForLens, publishPostForLens, quotePostForLens } from '@/helpers/publishPost.js';
import { useCustomSnackbar } from '@/hooks/useCustomSnackbar.js';
import { ComposeModalRef } from '@/modals/controls.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';
import { useLensStateStore } from '@/store/useLensStore.js';

interface ComposeSendProps {}
export default function ComposeSend(props: ComposeSendProps) {
    const currentLensProfile = useLensStateStore.use.currentProfile();

    const type = useComposeStateStore.use.type();
    const chars = useComposeStateStore.use.chars();
    const images = useComposeStateStore.use.images();
    const video = useComposeStateStore.use.video();
    const post = useComposeStateStore.use.post();

    const enqueueSnackbar = useCustomSnackbar();

    const charsLength = useMemo(() => chars.length, [chars]);

    const disabled = useMemo(
        () => (charsLength === 0 || charsLength > 280) && images.length === 0 && !video,
        [charsLength, images.length, video],
    );

    const charsOverflow = useMemo(() => charsLength > 280, [charsLength]);

    const [{ loading }, handleSend] = useAsyncFn(async () => {
        if (currentLensProfile?.profileId) {
            if (type === 'compose') {
                try {
                    await publishPostForLens(currentLensProfile?.profileId, chars, images, video);
                    enqueueSnackbar(t`Posted on Lens`, {
                        variant: 'success',
                    });
                    ComposeModalRef.close();
                } catch {
                    enqueueSnackbar(t`Failed to post on Lens`, {
                        variant: 'error',
                    });
                }
            }

            if (type === 'reply') {
                if (!post) return;
                try {
                    await commentPostForLens(currentLensProfile?.profileId, post.postId, chars, images, video);
                    enqueueSnackbar(t`Replied on Lens`, {
                        variant: 'success',
                    });
                    ComposeModalRef.close();
                } catch {
                    enqueueSnackbar(t`Failed to relay on Lens. @${currentLensProfile.handle}`, {
                        variant: 'error',
                    });
                }
            }

            if (type === 'quote') {
                if (!post) return;
                try {
                    await quotePostForLens(currentLensProfile?.profileId, post.postId, chars, images, video);
                    enqueueSnackbar(t`Posted on Lens`, {
                        variant: 'success',
                    });
                    ComposeModalRef.close();
                } catch {
                    enqueueSnackbar(t`Failed to quote on Lens. @${currentLensProfile.handle}`, {
                        variant: 'error',
                    });
                }
            }
        }
    }, [chars, currentLensProfile?.handle, currentLensProfile?.profileId, enqueueSnackbar, images, post, type, video]);

    return (
        <div className=" flex h-[68px] items-center justify-end gap-4 px-4 shadow-send">
            <div className=" flex items-center gap-[10px] whitespace-nowrap text-[15px] text-main">
                <CountdownCircle count={charsLength} width={24} height={24} className="flex-shrink-0" />
                <span className={classNames(charsOverflow ? ' text-danger' : '')}>{charsLength} / 280</span>
            </div>

            <button
                className={classNames(
                    ' flex h-10 w-[120px] items-center justify-center gap-1 rounded-full bg-black text-[15px] font-bold text-white dark:bg-white dark:text-black',
                    disabled ? ' cursor-no-drop opacity-50' : '',
                )}
                onClick={() => {
                    if (!disabled) {
                        handleSend();
                    }
                }}
            >
                {loading ? (
                    <LoadingIcon width={16} height={16} className="animate-spin" />
                ) : (
                    <>
                        <SendIcon width={18} height={18} className=" text-foreground" />
                        <span>
                            <Trans>Send</Trans>
                        </span>
                    </>
                )}
            </button>
        </div>
    );
}
