import { t } from '@lingui/macro';
import { memo, useState } from 'react';

import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { classNames } from '@/helpers/classNames.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useToggleFollow } from '@/hooks/useToggleFollow.js';
import { LoginModalRef } from '@/modals/controls.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

enum FollowLabel {
    Follow = 'Follow',
    Unfollow = 'Unfollow',
    Following = 'Following',
}

interface FollowButtonProps {
    profile: Profile;
}

export const FollowButton = memo(function FollowButton({ profile }: FollowButtonProps) {
    const [followHover, setFollowHover] = useState(false);
    const [isFollowing, { loading }, handleToggle] = useToggleFollow(profile);

    const isLogin = useIsLogin();

    const buttonText = isFollowing ? (followHover ? t`Unfollow` : t`Following`) : t`Follow`;
    const buttonState = isFollowing ? (followHover ? FollowLabel.Unfollow : FollowLabel.Following) : FollowLabel.Follow;

    return (
        <ClickableButton
            className={classNames(
                ' flex h-8 w-[100px] items-center justify-center rounded-full text-[15px] font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50',
                buttonState === FollowLabel.Follow ? ' bg-main text-primaryBottom hover:opacity-80' : '',
                buttonState === FollowLabel.Following ? ' border-[1.5px] border-lightMain text-lightMain' : '',
                buttonState === FollowLabel.Unfollow
                    ? ' border-[1.5px] border-danger border-opacity-50 bg-danger bg-opacity-20 text-danger'
                    : '',
            )}
            disabled={loading}
            onMouseEnter={() => setFollowHover(true)}
            onMouseLeave={() => setFollowHover(false)}
            onClick={() => (isLogin ? handleToggle() : LoginModalRef.open({ source: profile.source }))}
        >
            {loading ? <LoadingIcon width={16} height={16} className="mr-2 animate-spin" /> : null}
            {buttonText}
        </ClickableButton>
    );
});
