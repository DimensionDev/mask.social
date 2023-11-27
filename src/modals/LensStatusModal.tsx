'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Trans } from '@lingui/react';
import { forwardRef, Fragment } from 'react';

import { SocialPlatform } from '@/constants/enum.js';
import { Image } from '@/esm/Image.js';
import type { SingletonModalRefCreator } from '@/maskbook/packages/shared-base/src/index.js';
import { useSingletonModal } from '@/maskbook/packages/shared-base-ui/src/index.js';
import { LogoutModalRef } from '@/modals/controls.js';
import { useLensStateStore } from '@/store/useLensStore.js';

export const LensStatusModal = forwardRef<SingletonModalRefCreator>(function LensStatusModal(_, ref) {
    const lensAccounts = useLensStateStore.use.accounts();
    const currentAccount = useLensStateStore.use.currentAccount?.();
    const [open, dispatch] = useSingletonModal(ref);

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
                                <div className="flex w-[260px] flex-col gap-[23px] rounded-[16px] border-[0.5px] border-lightLineSecond p-[24px]">
                                    {lensAccounts.map(({ avatar, profileId, id, name }) => (
                                        <div key={id} className="flex items-center justify-between gap-[8px]">
                                            <div className="flex h-[40px] w-[48px] items-start justify-start">
                                                <div className="relative h-[40px] w-[40px]">
                                                    <div className="absolute left-0 top-0 h-[40px] w-[40px] rounded-[99px] shadow backdrop-blur-lg">
                                                        <Image
                                                            src={avatar}
                                                            alt="avatar"
                                                            width={36}
                                                            height={36}
                                                            className="rounded-[99px]"
                                                        />
                                                    </div>
                                                    <Image
                                                        className="absolute left-[24px] top-[24px] h-[16px] w-[16px] rounded-[99px] border border-white shadow"
                                                        src={'/svg/lens.svg'}
                                                        alt="logo"
                                                        width={16}
                                                        height={16}
                                                    />
                                                </div>
                                            </div>
                                            <div className="inline-flex h-[39px] shrink grow basis-0 flex-col items-start justify-center">
                                                <div className="font-['PingFang SC'] text-[15px] font-medium text-main">
                                                    {name}
                                                </div>
                                                <div className="font-['PingFang SC'] text-[15px] font-normal text-lightSecond">
                                                    @{profileId}
                                                </div>
                                            </div>
                                            {currentAccount && currentAccount.profileId === profileId ? (
                                                <div
                                                    className="h-[8px] w-[8px] rounded-[99px] bg-[#3DC233]"
                                                    style={{ filter: 'drop-shadow(0px 4px 10px #3DC233)' }}
                                                />
                                            ) : null}
                                        </div>
                                    ))}
                                    <button className="flex w-full items-center gap-[8px]">
                                        <Image src={'/svg/userAdd.svg'} alt="logo" width={24} height={24} />
                                        <div className=" text-[17px] font-bold leading-[22px] text-[#101010]">
                                            <Trans id="Change account" />
                                        </div>
                                    </button>
                                    <button
                                        className="flex items-center gap-[8px]"
                                        onClick={() => {
                                            LogoutModalRef.open({ platform: SocialPlatform.Lens });
                                            dispatch?.close();
                                        }}
                                    >
                                        <Image src={'/svg/logOut.svg'} alt="logo" width={24} height={24} />
                                        <div className=" text-[17px] font-bold leading-[22px] text-[#f00]">
                                            <Trans id="Log out" />
                                        </div>
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
});
