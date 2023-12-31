'use client';

import { Trans } from '@lingui/macro';
import { usePathname } from 'next/navigation.js';

import RightArrowIcon from '@/assets/right-arrow.svg';
import { Link } from '@/esm/Link.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';

const settings = [
    { name: <Trans>Display</Trans>, link: '/display' },
    { name: <Trans>Connected Accounts</Trans>, link: '/connected' },
    { name: <Trans>Communities</Trans>, link: '/communities' },
    { name: <Trans>More</Trans>, link: '/more' },
];

export function SettingList() {
    const isLoggedIn = useIsLogin();
    const pathname = usePathname();
    return (
        <div className="flex min-h-full min-w-[280px] flex-col border-r border-line p-[24px]">
            <div className=" pb-[24px] text-[20px] font-bold leading-[24px] text-lightMain">
                <Trans>Settings</Trans>
            </div>
            {settings.map(({ name, link }) => {
                return link === '/connected' && !isLoggedIn ? null : (
                    <Link
                        className={`mb-[24px] flex items-center justify-between border-b border-line pb-[4px] text-[18px] leading-[24px] text-main hover:font-bold ${
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
