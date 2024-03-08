import { Avatar } from '@/components/Avatar.js';
import { SourceIcon } from '@/components/SourceIcon.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface ProfileAvatarProps extends React.HTMLAttributes<HTMLElement> {
    profile: Profile;
    size?: number;
    linkable?: boolean;
    clickable?: boolean;
}

export function ProfileAvatar(props: ProfileAvatarProps) {
    const { profile, size = 40, clickable = false, linkable = false, ...elementProps } = props;

    const content = (
        <div className="relative md:h-[36px] md:w-[36px] lg:h-[40px] lg:w-[40px]">
            <div
                className="absolute left-0 top-0 rounded-full shadow backdrop-blur-lg"
                style={{
                    width: size,
                    height: size,
                }}
            >
                <Avatar src={profile.pfp} size={size} alt={profile.displayName} />
            </div>
            <SourceIcon
                className="absolute left-[24px] top-[24px] h-[16px] w-[16px] rounded-full border border-white shadow"
                source={profile.source}
                size={16}
            />
        </div>
    );

    return linkable ? (
        <Link
            className={classNames('flex items-start justify-start md:h-[36px] md:w-[36px] lg:h-[40px] lg:w-[48px]', {
                'cursor-pointer': clickable,
            })}
            href={getProfileUrl(profile)}
            {...elementProps}
        >
            {content}
        </Link>
    ) : (
        <div
            className={classNames('flex items-start justify-start md:h-[36px] md:w-[36px] lg:h-[40px] lg:w-[48px]', {
                'cursor-pointer': clickable,
            })}
            {...elementProps}
        >
            {content}
        </div>
    );
}
