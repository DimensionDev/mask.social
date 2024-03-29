'use client';

import { delay } from '@masknet/kit';

import { ProfileSettings } from '@/components/Login/ProfileSettings.js';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { Tippy } from '@/esm/Tippy.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { DraggablePopoverRef } from '@/modals/controls.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useNavigatorState } from '@/store/useNavigatorStore.js';

interface ProfileAvatarInteractiveProps {
    profile: Profile;
}

export function ProfileAvatarInteractive({ profile }: ProfileAvatarInteractiveProps) {
    const { updateSidebarOpen } = useNavigatorState();
    const isMedium = useIsMedium();

    return isMedium ? (
        <Tippy
            placement="top-start"
            duration={200}
            arrow={false}
            trigger="click"
            hideOnClick
            interactive
            className="account-settings"
            content={<ProfileSettings source={profile.source} />}
        >
            <div className=" flex justify-center">
                <ProfileAvatar profile={profile} clickable />
            </div>
        </Tippy>
    ) : (
        <div
            className=" flex justify-center"
            onClick={async () => {
                updateSidebarOpen(false);
                await delay(300);
                DraggablePopoverRef.open({
                    content: <ProfileSettings source={profile.source} />,
                });
            }}
        >
            <ProfileAvatar profile={profile} clickable />
        </div>
    );
}
