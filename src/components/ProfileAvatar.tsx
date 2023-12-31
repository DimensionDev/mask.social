import { Avatar } from '@/components/Avatar.js';
import { SourceIcon } from '@/components/SourceIcon.js';
import { classNames } from '@/helpers/classNames.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface ProfileAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    profile: Profile;
    size?: number;
    clickable?: boolean;
}

export function ProfileAvatar(props: ProfileAvatarProps) {
    const { profile, size = 40, clickable = true, ...divProps } = props;

    return (
        <div
            className={classNames('flex items-start justify-start md:h-[36px] md:w-[36px] lg:h-[40px] lg:w-[48px]', {
                'cursor-pointer': clickable,
            })}
            {...divProps}
        >
            <div className="relative md:h-[36px] md:w-[36px] lg:h-[40px] lg:w-[40px]">
                <div
                    className="absolute left-0 top-0 rounded-full shadow backdrop-blur-lg"
                    style={{
                        height: size,
                        width: size,
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
        </div>
    );
}
