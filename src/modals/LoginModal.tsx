'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Trans, t } from '@lingui/macro';
import { delay, getEnumAsArray } from '@masknet/kit';
import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { useSingletonModal } from '@masknet/shared-base-ui';
import { useSnackbar } from 'notistack';
import { forwardRef, Fragment, Suspense, useState } from 'react';

import CloseIcon from '@/assets/close.svg';
import LeftArrowIcon from '@/assets/left-arrow.svg';
import LoadingIcon from '@/assets/loading.svg';
import { LoginButton } from '@/components/Login/LoginButton.js';
import { LoginFarcaster } from '@/components/Login/LoginFarcaster.js';
import { LoginLens } from '@/components/Login/LoginLens.js';
import { SocialPlatform } from '@/constants/enum.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';

export interface LoginModalProps {
    platform?: SocialPlatform;
}

export const LoginModal = forwardRef<SingletonModalRefCreator<LoginModalProps | void>>(function LoginModal(_, ref) {
    const [platform, setPlatform] = useState<SocialPlatform>();

    const { enqueueSnackbar } = useSnackbar();

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen: (props) => {
            setPlatform(props?.platform);
        },
        onClose: async () => {
            // setCurrent will trigger a re-render, so we need to delay the setCurrent(undefined) to avoid the re-render
            await delay(500);
            setPlatform(undefined);
        },
    });

    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog as="div" className="relative z-[999]" onClose={() => dispatch?.close()}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    {/* backdrop */}
                    <div className="fixed inset-0 bg-black/25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="transform rounded-[12px] bg-bgModal transition-all">
                                <div
                                    className="inline-flex h-[56px] w-[600px] items-center justify-center gap-2 rounded-t-[12px] p-4"
                                    style={{ background: 'var(--m-modal-title-bg)' }}
                                >
                                    <button
                                        onClick={() => {
                                            platform === SocialPlatform.Farcaster
                                                ? setPlatform(undefined)
                                                : dispatch?.close();
                                        }}
                                    >
                                        {platform === SocialPlatform.Farcaster ? (
                                            <LeftArrowIcon width={24} height={24} />
                                        ) : (
                                            <CloseIcon width={24} height={24} />
                                        )}
                                    </button>
                                    <div className="shrink grow basis-0 text-center text-lg font-bold leading-snug text-main">
                                        {platform === SocialPlatform.Lens ? (
                                            <Trans>Select Account</Trans>
                                        ) : platform === SocialPlatform.Farcaster ? (
                                            <Trans>Log in to Farcaster account</Trans>
                                        ) : (
                                            <Trans>Login</Trans>
                                        )}
                                    </div>
                                    <div className="relative h-[24px] w-[24px]" />
                                </div>
                                {!platform ? (
                                    <div
                                        className="flex w-[600px] flex-col rounded-[12px]"
                                        style={{ boxShadow: '0px 4px 30px 0px rgba(0, 0, 0, 0.10)' }}
                                    >
                                        <div className="flex w-full flex-col gap-[16px] p-[16px] ">
                                            {getEnumAsArray(SocialPlatform).map(({ value: platform }) => (
                                                <LoginButton
                                                    key={platform}
                                                    platform={platform}
                                                    onClick={async () => {
                                                        try {
                                                            await getWalletClientRequired();
                                                        } catch (error) {
                                                            enqueueSnackbar(
                                                                error instanceof Error
                                                                    ? error.message
                                                                    : t`Failed to connect wallet.`,
                                                                { variant: 'error' },
                                                            );
                                                            return;
                                                        }

                                                        setPlatform(platform);
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <Suspense
                                        fallback={
                                            <div className="flex h-[194px] w-[600px] items-center justify-center">
                                                <LoadingIcon className="animate-spin" width={24} height={24} />
                                            </div>
                                        }
                                    >
                                        {platform === SocialPlatform.Lens ? <LoginLens /> : null}
                                        {platform === SocialPlatform.Farcaster ? <LoginFarcaster /> : null}
                                    </Suspense>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
});
