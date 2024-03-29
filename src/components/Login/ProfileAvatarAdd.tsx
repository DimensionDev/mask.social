import { PlusIcon } from '@heroicons/react/24/outline';

import { SourceIcon } from '@/components/SourceIcon.js';
import type { SocialPlatform } from '@/constants/enum.js';
import { useIsLarge } from '@/hooks/useMediaQuery.js';

interface ProfileAvatarAddProps extends React.HTMLAttributes<HTMLDivElement> {
    source: SocialPlatform;
}

export function ProfileAvatarAdd(props: ProfileAvatarAddProps) {
    const { source, ...divProps } = props;

    const isLarge = useIsLarge();

    const size = isLarge ? 40 : 36;

    const style = {
        width: size,
        height: size,
    };

    return (
        <div className="relative cursor-pointer md:mx-auto lg:m-0 " style={style} {...divProps}>
            <div className="absolute left-0 top-0 rounded-full shadow backdrop-blur-lg" style={style}>
                <SourceIcon source={source} size={size} />
            </div>
            <PlusIcon
                className="absolute left-6 top-5 rounded-full bg-white text-black shadow lg:left-8 lg:top-6"
                width={16}
                height={16}
            />
        </div>
    );
}
