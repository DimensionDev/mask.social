import { Trans } from '@lingui/macro';

import FollowButton from '@/app/profile/components/FollowButton.js';
import { SocialPlatform } from '@/constants/enum.js';
import { Image } from '@/esm/Image.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface InfoProps {
    platform: SocialPlatform;
    handle: string;
    isMyProfile: boolean;
    profile?: Profile;
}

export default function Info({ platform, handle, isMyProfile, profile }: InfoProps) {
    return (
        <div className=" flex gap-3 px-4">
            <Image
                src={profile?.pfp || '/svg/lens.svg'}
                width={80}
                height={80}
                alt="avatar"
                className=" h-20 w-20 rounded-full"
            />

            <div className=" relative flex flex-1 flex-col gap-[6px] pt-4">
                <div className=" absolute right-0 top-4">
                    {profile ? <FollowButton profile={profile} isMyProfile={isMyProfile} /> : null}
                </div>

                <div className=" flex flex-col">
                    <div className=" flex items-center gap-2">
                        <span className=" font-black text-lightMain">{profile?.nickname ?? handle}</span>
                        <Image
                            src={platform === SocialPlatform.Lens ? '/svg/lens.svg' : '/svg/farcaster.svg'}
                            width={20}
                            height={20}
                            alt="platform"
                            className=" h-5 w-5"
                        />
                    </div>
                    <span className=" text-[#767676]">@{handle}</span>
                </div>

                <div>{profile?.bio ?? '-'}</div>

                <div className=" flex gap-3">
                    <div className=" flex gap-1">
                        <span className=" font-bold text-lightMain">{profile?.followingCount ?? 0}</span>
                        <span className=" text-[#767676]">
                            <Trans>Following</Trans>
                        </span>
                    </div>

                    <div className=" flex gap-1">
                        <span className=" font-bold text-lightMain">{profile?.followerCount ?? 0}</span>
                        <span className=" text-[#767676]">
                            <Trans>Followers</Trans>
                        </span>
                    </div>
                </div>

                <div className=" text-sm text-[#767676]">
                    <Trans>Not followed by anyone you&apos;re following</Trans>
                </div>
            </div>
        </div>
    );
}
