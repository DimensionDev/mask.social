import { Popover, Transition } from '@headlessui/react';
import { getEnumAsArray } from '@masknet/kit';
import { Fragment } from 'react';

import { PostByItem } from '@/components/Compose/PostByItem.js';
import { SocialPlatform } from '@/constants/enum.js';

interface PostByProps {}

export function PostBy(props: PostByProps) {
    return (
        <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0 translate-y-1"
        >
            <Popover.Panel className=" absolute bottom-full right-0 flex w-[280px] -translate-y-3 flex-col gap-2 rounded-lg bg-bgModal p-3 text-[15px] shadow-popover">
                {getEnumAsArray(SocialPlatform).map(({ key, value: source }) => (
                    <PostByItem key={key} source={source} />
                ))}
            </Popover.Panel>
        </Transition>
    );
}
