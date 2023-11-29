import { Popover } from '@headlessui/react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext.js';
import { Trans } from '@lingui/macro';
import { $getSelection } from 'lexical';
import { type ChangeEvent, type Dispatch, type SetStateAction, useCallback, useRef } from 'react';

import PostBy from '@/components/compose/PostBy.js';
import ReplyRestriction from '@/components/compose/ReplyRestriction.js';
import { Image } from '@/esm/Image.js';
import uploadToIPFS, { type IPFSResponse } from '@/services/uploadToIPFS.js';

interface ComposeActionProps {
    type: 'compose' | 'quote' | 'reply';
    setImages: Dispatch<
        SetStateAction<
            Array<{
                file: File;
                ipfs: IPFSResponse;
            }>
        >
    >;
}
export default function ComposeAction({ type, setImages }: ComposeActionProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [editor] = useLexicalComposerContext();

    const insertText = useCallback(
        (text: string) => {
            editor.update(() => {
                const selection = $getSelection();
                if (selection) {
                    selection.insertText(text);
                }
            });
        },
        [editor],
    );

    const handleFileChange = useCallback(
        async (event: ChangeEvent<HTMLInputElement>) => {
            const files = event.target.files;

            if (files) {
                const res = await uploadToIPFS([...files]);
                setImages((_images) =>
                    _images.concat(
                        res.map((ipfs, index) => ({
                            file: files[index],
                            ipfs,
                        })),
                    ),
                );
            }
        },
        [setImages],
    );

    return (
        <div className=" px-4 pb-4">
            <div className=" flex h-9 items-center gap-3">
                <Image
                    src="/svg/gallery.svg"
                    width={24}
                    height={24}
                    alt="gallery"
                    className=" cursor-pointer"
                    onClick={() => {
                        fileInputRef.current?.click();
                    }}
                />
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={fileInputRef}
                    className=" hidden"
                    onChange={handleFileChange}
                />
                <Image
                    src="/svg/at.svg"
                    width={24}
                    height={24}
                    alt="at"
                    className=" cursor-pointer"
                    onClick={() => insertText('@')}
                />
                <Image
                    src="/svg/numberSign.svg"
                    width={24}
                    height={24}
                    alt="numberSign"
                    className=" cursor-pointer"
                    onClick={() => insertText('#')}
                />
            </div>

            <div className=" flex h-9 items-center justify-between">
                <span className=" text-sm text-[#767F8D]">
                    <Trans>Post by</Trans>
                </span>
                <Popover as="div" className="relative">
                    {(_) => (
                        <>
                            <Popover.Button className=" flex cursor-pointer gap-1 text-[#07101B] focus:outline-none">
                                <span className=" text-sm font-bold">@LensA, @FarcasterA</span>
                                {type === 'compose' && <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />}
                            </Popover.Button>
                            <PostBy />
                        </>
                    )}
                </Popover>
            </div>

            <div className=" flex h-9 items-center justify-between">
                <span className=" text-sm text-[#767F8D]">
                    <Trans>Reply Restriction</Trans>
                </span>
                <Popover as="div" className="relative">
                    {(_) => (
                        <>
                            <Popover.Button className=" flex cursor-pointer gap-1 text-[#07101B] focus:outline-none">
                                <span className=" text-sm font-bold">
                                    <Trans>Everyone can reply</Trans>
                                </span>
                                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                            </Popover.Button>
                            <ReplyRestriction />
                        </>
                    )}
                </Popover>
            </div>
        </div>
    );
}
