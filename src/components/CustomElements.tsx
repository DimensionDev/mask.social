'use client';

import { CrossIsolationMessages } from '@masknet/shared-base';
import { useEffect } from 'react';
import { useAsync, useUpdateEffect } from 'react-use';
import { useAccount, useChainId } from 'wagmi';

import { connectMaskWithWagmi } from '@/helpers/connectWagmiWithMask.js';
import { getTypedMessageRedPacket } from '@/helpers/getTypedMessage.js';
import { ComposeModalRef } from '@/modals/controls.js';

export default function CustomElements() {
    const account = useAccount();
    const chainId = useChainId();

    const { value } = useAsync(async () => {
        await import('@masknet/flags/build-info').then((module) => {
            module.setupBuildInfoManually({
                channel:
                    process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'
                        ? 'stable'
                        : process.env.NODE_ENV === 'production'
                          ? 'stable'
                          : 'insider',
            });
        });

        // storage must be imported before custom-elements
        await import('@/mask/setup/storage.js');
        await import('@/mask/custom-elements.js');

        return true;
    }, []);

    useEffect(() => {
        if (!value) return;
        return CrossIsolationMessages.events.compositionDialogEvent.on((event) => {
            if (!event.open) return;

            ComposeModalRef.open({
                type: 'compose',
                typedMessage: getTypedMessageRedPacket(event.options?.initialMetas),
                redpacketProps: event.options?.pluginMeta?.payloadImage ? event.options.pluginMeta : undefined,
            });
        });
    }, [value]);

    useUpdateEffect(() => {
        if (!account.address || !chainId || !value) return;
        connectMaskWithWagmi();
    }, [account.address, chainId, value]);

    return null;
}
