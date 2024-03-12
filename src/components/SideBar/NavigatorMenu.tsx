'use client';

import { PlusIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { Trans } from '@lingui/macro';
import { usePathname } from 'next/navigation.js';
import { memo } from 'react';

import DiscoverSelectedIcon from '@/assets/discover.selected.svg';
import DiscoverIcon from '@/assets/discover.svg';
import FollowingSelectedIcon from '@/assets/following.selected.svg';
import FollowingIcon from '@/assets/following.svg';
import NotificationSelectedIcon from '@/assets/notification.selected.svg';
import NotificationIcon from '@/assets/notification.svg';
import ProfileSelectedIcon from '@/assets/profile.selected.svg';
import ProfileIcon from '@/assets/profile.svg';
import SettingsSelectedIcon from '@/assets/setting.selected.svg';
import SettingsIcon from '@/assets/setting.svg';
import WalletIcon from '@/assets/wallet.svg';
import { LoginStatusBar } from '@/components/Login/LoginStatusBar.js';
import { ConnectWalletNav } from '@/components/SideBar/ConnectWalletNav.js';
import { PageRoutes } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useIsMyProfile } from '@/hooks/useIsMyProfile.js';
import { useIsLarge } from '@/hooks/useMediaQuery.js';
import { ComposeModalRef, LoginModalRef } from '@/modals/controls.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export const NavigatorMenu = memo(function NavigatorMenu() {
    const isLarge = useIsLarge();

    const currentSource = useGlobalState.use.currentSource();

    const isLogin = useIsLogin();

    const pathname = usePathname();
    const isMyProfile = useIsMyProfile(
        currentSource,
        isRoutePathname(pathname, '/profile') ? pathname.split('/')[3] ?? '' : '',
    );

    const checkIsSelected = (href: `/${string}`) =>
        href === PageRoutes.Profile ? isMyProfile || pathname === PageRoutes.Profile : isRoutePathname(pathname, href);

    return (
        <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li className="flex">
                    <ul role="list" className="space-y-1">
                        {[
                            {
                                href: PageRoutes.Home,
                                name: <Trans>Discover</Trans>,
                                icon: DiscoverIcon,
                                selectedIcon: DiscoverSelectedIcon,
                            },
                            {
                                href: PageRoutes.Following,
                                name: <Trans>Following</Trans>,
                                icon: FollowingIcon,
                                selectedIcon: FollowingSelectedIcon,
                            },
                            {
                                href: PageRoutes.Notifications,
                                name: <Trans>Notifications</Trans>,
                                icon: NotificationIcon,
                                selectedIcon: NotificationSelectedIcon,
                            },
                            {
                                href: PageRoutes.Profile,
                                name: <Trans>Profile</Trans>,
                                icon: ProfileIcon,
                                selectedIcon: ProfileSelectedIcon,
                            },
                            {
                                href: '/connect-wallet',
                                name: <Trans>Connect</Trans>,
                                icon: WalletIcon,
                                selectedIcon: WalletIcon,
                            },
                            {
                                href: PageRoutes.Settings,
                                name: <Trans>Settings</Trans>,
                                icon: SettingsIcon,
                                selectedIcon: SettingsSelectedIcon,
                            },
                        ].map((item) => {
                            const isSelected =
                                item.href === '/' ? pathname === '/' : checkIsSelected(item.href as `/${string}`);
                            const Icon = isSelected ? item.selectedIcon : item.icon;
                            return (
                                <li className="flex rounded-lg text-main" key={item.href}>
                                    {item.href === '/connect-wallet' ? (
                                        <ConnectWalletNav />
                                    ) : (
                                        <Link
                                            href={item.href}
                                            className={classNames(
                                                'lg: flex flex-grow-0 gap-x-3 rounded-lg text-xl/5 hover:bg-bg md:rounded-full md:p-2 lg:px-4 lg:py-3',
                                                { 'font-bold': isSelected },
                                            )}
                                        >
                                            <Icon width={20} height={20} />
                                            <span className="hidden lg:inline">{item.name}</span>
                                        </Link>
                                    )}
                                </li>
                            );
                        })}
                        {isLogin ? (
                            isLarge ? (
                                <li>
                                    <button
                                        type="button"
                                        className="w-[200px] rounded-2xl bg-main p-2 text-xl font-bold leading-6 text-primaryBottom"
                                        onClick={() => ComposeModalRef.open({})}
                                    >
                                        <Trans>Post</Trans>
                                    </button>
                                </li>
                            ) : (
                                <li className="text-center">
                                    <button
                                        type="button"
                                        className="rounded-full bg-main p-1 text-primaryBottom"
                                        onClick={() => ComposeModalRef.open({})}
                                    >
                                        <PlusIcon className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                </li>
                            )
                        ) : null}
                    </ul>
                </li>
                <li className="-mx-2 mb-20 mt-auto md:text-center">
                    {isLogin ? (
                        <LoginStatusBar />
                    ) : isLarge ? (
                        <button
                            onClick={() => {
                                LoginModalRef.open();
                            }}
                            type="button"
                            className="w-[200px] rounded-2xl bg-main p-2 text-xl font-bold leading-6 text-primaryBottom"
                        >
                            <Trans>Login</Trans>
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                LoginModalRef.open();
                            }}
                            type="button"
                            className="rounded-full bg-main p-1 text-primaryBottom"
                        >
                            <UserPlusIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                    )}
                </li>
            </ul>
        </nav>
    );
});
