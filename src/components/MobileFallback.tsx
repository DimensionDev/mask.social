'use client';

import { t } from '@lingui/macro';

import DarkLogo from '@/assets/logo.dark.svg';
import LightLogo from '@/assets/logo.light.svg';
import { Image } from '@/esm/Image.js';
import { Link } from '@/esm/Link.js';
import { useDarkMode } from '@/hooks/useDarkMode.js';

export function MobileFallback() {
    const { isDarkMode } = useDarkMode();

    return (
        <div className="md:hidden">
            <div className="px-4">
                {!isDarkMode ? <LightLogo width={134} height={64} /> : <DarkLogo width={134} height={64} />}
            </div>
            <div className="flex h-screen flex-col items-center justify-center">
                <Image src="/image/radar.png" width={200} height={106} alt="Please open this link on PC explore." />
                <div className="mt-11 text-sm font-bold">{t`Please open this link on PC explore.`}</div>
                <Link href="https://firefly.mask.social" className="mt-11 text-[#1C68F3] underline">
                    firefly.mask.social
                </Link>
            </div>
        </div>
    );
}
