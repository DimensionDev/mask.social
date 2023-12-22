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
            className={classNames(' flex h-10 w-10 items-start justify-start', {
                'cursor-pointer': clickable,
            })}
            {...divProps}
        >
            <div className="relative h-10 w-10">
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
                    className="absolute bottom-0 right-0 top-6 h-4 w-4 rounded-full border border-white shadow"
                    source={profile.source}
                    size={16}
                />
            </div>
        </div>
    );
}
