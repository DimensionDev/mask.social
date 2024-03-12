'use client';

import { memo } from 'react';

import { SideBarForDesktop } from '@/components/SideBar/SideBarForDesktop.js';
import { SideBarForMobile } from '@/components/SideBar/SideBarForMobile.js';
import { useIsSmall } from '@/hooks/useMediaQuery.js';

export const SideBar = memo(function SideBar() {
    const isSmall = useIsSmall();

    return isSmall ? <SideBarForDesktop /> : <SideBarForMobile />;
});
