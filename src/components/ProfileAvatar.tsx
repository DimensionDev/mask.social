import { Avatar } from '@/components/Avatar.js';
import { SourceIcon } from '@/components/SourceIcon.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { useIsLarge } from '@/hooks/useMediaQuery.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface ProfileAvatarProps extends React.HTMLAttributes<HTMLElement> {
    profile: Profile;
    size?: number;
    linkable?: boolean;
    clickable?: boolean;
    enableSourceIcon?: boolean;
}

export function ProfileAvatar(props: ProfileAvatarProps) {
    const { profile, clickable = false, linkable = false, enableSourceIcon = true, ...elementProps } = props;

    const isLarge = useIsLarge();

    const size = props.size ?? (isLarge ? 40 : 36);
    const style = {
        width: size,
        height: size,
    };

    const content = (
        <div className="relative" style={style}>
            <div className="absolute left-0 top-0 rounded-full shadow backdrop-blur-lg" style={style}>
                <Avatar src={profile.pfp} size={size} alt={profile.displayName} />
            </div>
            {enableSourceIcon ? (
                <SourceIcon
                    className="absolute left-6 top-6 h-4 w-4 rounded-full border border-white shadow"
                    source={profile.source}
                    size={16}
                />
            ) : null}
        </div>
    );

    return linkable ? (
        <Link
            className={classNames('flex items-start justify-start ', {
                'cursor-pointer': clickable,
            })}
            style={style}
            href={getProfileUrl(profile)}
            {...elementProps}
        >
            {content}
        </Link>
    ) : (
        <div
            className={classNames('flex items-start justify-start ', {
                'cursor-pointer': clickable,
            })}
            style={style}
            {...elementProps}
        >
            {content}
        </div>
    );
}
