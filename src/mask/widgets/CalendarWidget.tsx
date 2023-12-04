'use client';

import { CalendarContent } from '@masknet/plugin-calendar';
import { DisableShadowRootContext, ShadowRootIsolation } from '@masknet/theme';
import { usePathname } from 'next/navigation.js';

import { Providers } from '@/app/provider.js';
import { Providers as MaskProviders } from '@/mask/widgets/Providers.js';

export default function CalendarWidget() {
    const pathname = usePathname();

    console.log('DEBUG: pathname');
    console.log({
        pathname,
    });

    return (
        <Providers>
            <MaskProviders>
                <DisableShadowRootContext.Provider value={false}>
                    <ShadowRootIsolation>
                        <CalendarContent />
                    </ShadowRootIsolation>
                </DisableShadowRootContext.Provider>
            </MaskProviders>
        </Providers>
    );
}
