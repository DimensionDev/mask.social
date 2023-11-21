'use client';

import { Fragment, useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Image } from '@/esm/Image.js';
import { LensSocialMedia } from '@/providers/lens/SocialMedia.js';
import { LoginFarcaster } from '@/components/LoginFarcaster.js';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface LoginModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

interface connectParams {
    chain: any,
    openConnectModal: () => void,
    openChainModal: () => void,
    authenticationStatus: "loading" | "unauthenticated" | "authenticated" | undefined,
    account: any,
    mounted: boolean,
    connectModalOpen: boolean
    chainModalOpen: boolean
}

function usePrevious(value: boolean) {
    const ref = useRef<boolean>();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

export function LoginModal({ isOpen, setIsOpen }: LoginModalProps) {
    const [farcasterOpen, setFarcasterOpen] = useState(false);
    const [connectOpen, setConnectOpen] = useState(false)
    const [chainOpen, setChainOpen] = useState(false)
    const previousConnectModalOpen = usePrevious(connectOpen)
    const previousChainModalOpen = usePrevious(chainOpen)

    const closeModal = () => {
        setIsOpen(false);
    };

    const loginLens = useCallback(async () => {
        const lensProvider = new LensSocialMedia();
        await lensProvider.createSession();
        setIsOpen(false)
    }, [setIsOpen]);

    useEffect(() => {
        if (previousConnectModalOpen && !connectOpen) {
            loginLens()
        }
    }, [connectOpen, previousConnectModalOpen, loginLens]);


    useEffect(() => {
        if (previousChainModalOpen && !chainOpen) {
            loginLens()
        }
    }, [chainOpen, previousChainModalOpen, loginLens]);

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[999]" onClose={closeModal}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
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
                            <Dialog.Panel className="transform rounded-[12px] bg-white transition-all">
                                {!farcasterOpen ? (
                                    <div
                                        className="flex w-[600px] flex-col rounded-[12px]"
                                        style={{ boxShadow: '0px 4px 30px 0px rgba(0, 0, 0, 0.10)' }}
                                    >
                                        <div className="inline-flex h-[56px] w-[600px] items-center justify-center gap-2 rounded-t-[12px] bg-gradient-to-b from-white to-white p-4">
                                            <button
                                                onClick={() => {
                                                    setIsOpen(false);
                                                }}
                                            >
                                                <Image
                                                    className="relative h-[24px] w-[24px]"
                                                    src="/svg/close.svg"
                                                    alt="close"
                                                    width={24}
                                                    height={24}
                                                />
                                            </button>
                                            <div className="shrink grow basis-0 text-center font-['Helvetica'] text-lg font-bold leading-snug text-slate-950">
                                                Login
                                            </div>
                                            <div className="relative h-[24px] w-[24px]" />
                                        </div>
                                        <div className="flex w-full flex-col gap-[16px] p-[16px] ">
                                            <ConnectButton.Custom className="w-full">
                                                {({
                                                    chain,
                                                    openConnectModal,
                                                    openChainModal,
                                                    authenticationStatus,
                                                    account,
                                                    mounted,
                                                    connectModalOpen,
                                                    chainModalOpen
                                                }: connectParams) => {
                                                    setConnectOpen(connectModalOpen)
                                                    setChainOpen(chainModalOpen)
                                                    const ready = mounted && authenticationStatus !== 'loading';
                                                    const connected =
                                                        ready &&
                                                        account &&
                                                        chain &&
                                                        (!authenticationStatus ||
                                                            authenticationStatus === 'authenticated');

                                                    return (
                                                        <div
                                                            {...(!ready && {
                                                                'aria-hidden': true,
                                                                style: {
                                                                    opacity: 0,
                                                                    pointerEvents: 'none',
                                                                    userSelect: 'none',
                                                                },
                                                            })}
                                                        >

                                                            <button
                                                                className="group w-full flex flex-col rounded-lg p-[16px] hover:bg-lightBg"
                                                                onClick={() => {
                                                                    if (!connected) {
                                                                        openConnectModal()
                                                                    }
                                                                    if (chain?.unsupported) {
                                                                        openChainModal();
                                                                    }
                                                                }}
                                                            >
                                                                <div className="inline-flex w-full flex-col items-center justify-start gap-[8px] rounded-lg px-[16px] py-[24px]">
                                                                    <div className="relative h-[48px] w-[48px]">
                                                                        <Image
                                                                            className="left-0 top-0 rounded-full"
                                                                            src="/svg/lens.svg"
                                                                            width={48}
                                                                            height={48}
                                                                            alt="lens"
                                                                        />
                                                                    </div>
                                                                    <div className="font-['Helvetica'] text-sm font-bold leading-[18px] text-lightSecond group-hover:text-textMain">
                                                                        Lens
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        </div>
                                                    );
                                                }}
                                            </ConnectButton.Custom>
                                            <button
                                                className="group flex flex-col rounded-lg p-[16px] hover:bg-lightBg"
                                                onClick={() => {
                                                    setFarcasterOpen(true);
                                                }}
                                            >
                                                <div className="inline-flex w-full flex-col items-center justify-start gap-[8px] rounded-lg px-[16px] py-[24px]">
                                                    <div className="relative h-[48px] w-[48px]">
                                                        <Image
                                                            className="left-0 top-0 rounded-full"
                                                            src="/svg/farcaster.svg"
                                                            width={48}
                                                            height={48}
                                                            alt="lens"
                                                        />
                                                    </div>
                                                    <div className="font-['Helvetica'] text-sm font-bold leading-[18px] text-lightSecond group-hover:text-textMain">
                                                        Farcaster
                                                    </div>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <LoginFarcaster
                                        closeFarcaster={() => {
                                            setFarcasterOpen(false);
                                        }}
                                    />
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
