import { Dialog, Transition } from '@headlessui/react';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { useSingletonModal } from '@masknet/shared-base-ui';
import { forwardRef, Fragment, useEffect, useState } from 'react';
import { useStateList } from 'react-use';

import CloseIcon from '@/assets/close.svg';
import { PostActions } from '@/components/Actions/index.js';
import { Image } from '@/components/Image.js';
import { EMPTY_LIST } from '@/constants/index.js';
import type { Post } from '@/providers/types/SocialMedia.js';

export interface PreviewImagesModalOpenProps {
    images: string[];
    current: string;
    post?: Post;
}

export const PreviewImagesModal = forwardRef<SingletonModalRefCreator<PreviewImagesModalOpenProps>>(
    function PreviewImagesModal(_, ref) {
        const [current, setCurrent] = useState<string>();
        const [post, setPost] = useState<Post>();
        const [images, setImages] = useState<string[]>([]);

        const { state, setState, prev, next, currentIndex } = useStateList(images);
        const isMultiple = images.length > 1;
        const isAtStart = currentIndex === 0;
        const isAtEnd = currentIndex === images.length - 1;
        const currentIsIncluded = current && images.includes(current);
        useEffect(() => {
            if (currentIsIncluded) {
                setState(current);
            }
        }, [currentIsIncluded, setState, current]);

        const [open, dispatch] = useSingletonModal(ref, {
            onOpen: (props) => {
                setImages(props.images);
                setCurrent(props.current);
                setPost(props.post);
            },
            onClose: () => {
                setCurrent(undefined);
                setPost(undefined);
                setImages(EMPTY_LIST);
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
                        <div className="fixed inset-0 bg-black bg-opacity-80" />
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
                                <Dialog.Panel className="preview-actions flex transform-none flex-col items-center transition-all">
                                    {/* Fix transition hack  */}
                                    {open ? (
                                        <>
                                            <div className="mb-2 w-full">
                                                <CloseIcon
                                                    width={24}
                                                    height={24}
                                                    className="cursor-pointer text-white"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        event.preventDefault();
                                                        dispatch?.close();
                                                    }}
                                                />
                                            </div>

                                            <Image
                                                src={state ?? current}
                                                alt={state ?? current}
                                                width={1000}
                                                height={1000}
                                                style={{ width: 'auto', height: 'auto' }}
                                                className="max-h-[calc(100vh-110px)] max-w-full"
                                            />

                                            <div className="absolute bottom-0 my-1 flex w-[512px] items-center justify-between">
                                                <div className="mr-auto h-4 w-4">
                                                    {isMultiple && !isAtStart ? (
                                                        <ArrowLeftIcon
                                                            className="cursor-pointer text-secondary"
                                                            width={16}
                                                            height={16}
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                event.preventDefault();
                                                                prev();
                                                            }}
                                                        />
                                                    ) : null}
                                                </div>
                                                {post ? (
                                                    <PostActions post={post} disablePadding className="mx-auto" />
                                                ) : null}
                                                <div className="ml-auto h-4 w-4">
                                                    {isMultiple && !isAtEnd ? (
                                                        <ArrowRightIcon
                                                            className="cursor-pointer text-secondary"
                                                            width={16}
                                                            height={16}
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                event.preventDefault();
                                                                next();
                                                            }}
                                                        />
                                                    ) : null}
                                                </div>
                                            </div>
                                        </>
                                    ) : null}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        );
    },
);
