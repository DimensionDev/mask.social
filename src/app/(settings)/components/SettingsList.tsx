'use client';

import { Trans } from '@lingui/macro';
import { usePathname } from 'next/navigation.js';

import RightArrowIcon from '@/assets/right-arrow.svg';
import { Link } from '@/esm/Link.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';

export function SettingsList() {
    const isLoggedIn = useIsLogin();
    const pathname = usePathname();

    return (
        <div className="flex min-h-full min-w-full flex-col p-6 md:min-w-[280px] md:border-r md:border-line">
            <div className=" hidden pb-6 text-[20px] font-bold leading-[24px] text-lightMain md:block">
                <Trans>Settings</Trans>
            </div>
            {[
                { name: <Trans>General</Trans>, link: '/general' },
                { name: <Trans>Connected Accounts</Trans>, link: '/connected' },
                { name: <Trans>Communities</Trans>, link: '/communities' },
                { name: <Trans>More</Trans>, link: '/more' },
            ].map(({ name, link }) => {
                return link === '/connected' && !isLoggedIn ? null : (
                    <Link
                        className={`mb-6 flex items-center justify-between border-b border-line pb-1 text-[18px] leading-[24px] text-main hover:font-bold ${
                            isRoutePathname(pathname, `/settings${link}`) ? 'font-bold' : 'font-normal'
                        }`}
                        key={link}
                        href={`/settings${link}`}
                    >
                        {name} <RightArrowIcon width={20} height={20} />
                    </Link>
                );
            })}
        </div>
    );
}
