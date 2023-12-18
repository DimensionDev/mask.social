'use client';

import { isTypedMessageText, makeTypedMessageText } from '@masknet/typed-message';
import { useEffect } from 'react';
import { useAsync } from 'react-use';

import { setPluginDebuggerMessages } from '@/mask/message-host/index.js';
import { CrossIsolationMessages } from '@/maskbook/packages/shared-base/src/index.js';
import { editTypedMessageMeta } from '@/maskbook/packages/typed-message/react/src/index.js';
import { ComposeModalRef } from '@/modals/controls.js';

export default function CustomElements() {
    const { value } = useAsync(async () => {
        // setup mask runtime
        await import('@/mask/setup/locale.js');
        await import('@masknet/flags/build-info').then((module) => {
            const channel =
                process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'
                    ? 'beta'
                    : process.env.NODE_ENV === 'production'
                      ? 'stable'
                      : 'insider';

            module.setupBuildInfoManually({
                channel,
            });
        });
        await import('@/mask/setup/storage.js');
        await import('@/mask/setup/wallet.js');
        await import('@/mask/setup/theme.js');
        await import('@/mask/setup/custom-event-provider.js');
        await import('@/mask/plugin-host/enable.js');

        // define custom elements
        await import('@/mask/custom-elements/PageInspector.js');
        await import('@/mask/custom-elements/CalendarWidget.js');
        await import('@/mask/custom-elements/DecryptedPost.js');

        // plugin messages
        if (process.env.NODE_ENV === 'development') {
            await import('@masknet/plugin-debugger/messages').then((module) =>
                setPluginDebuggerMessages(module.PluginDebuggerMessages),
            );
        }

        return true;
    }, []);

    useEffect(() => {
        if (!value) return;
        return CrossIsolationMessages.events.compositionDialogEvent.on((event) => {
            if (!event.open) return;

            const initialMetas = event.options?.initialMetas;
            const message = initialMetas
                ? Object.entries(initialMetas).reduce((message, [meta, data]) => {
                      return editTypedMessageMeta(message, (map) => map.set(meta, data));
                  }, makeTypedMessageText(''))
                : null;

            ComposeModalRef.open({
                type: 'compose',
                typedMessage: message && isTypedMessageText(message) ? message : null,
            });
        });
    }, [value]);

    return null;
}
