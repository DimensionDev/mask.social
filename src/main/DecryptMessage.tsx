'use client';
import { RegistryContext, TypedMessageRender } from '@masknet/typed-message-react';
import React, { lazy, Suspense } from 'react';

import { useDecrypt } from './Decrypt/useDecrypt.js';
import { registry } from './TypedMessageRender/registry.js';

const PluginRender = lazy(() => import('./plugin-render.js'));

export function DecryptMessage(props: { text: string; version: string }) {
    const { text, version } = props;
    const [error, isE2E, message] = useDecrypt(text, version);
    console.log('useDecrypt', error, isE2E, message);

    if (isE2E)
        return (
            <p className="p-2">
                This message is a e2e encrypted message. You can only decrypt this message when it is encrypted to you
                and decrypt it with Mask Network extension.
            </p>
        );
    if (error)
        return (
            <p className="p-2">
                We encountered an error when try to decrypt this message: <br />
                {error.message}
            </p>
        );
    if (!message) return <p className="p-2">Decrypting...</p>;

    return (
        <RegistryContext.Provider value={registry.getTypedMessageRender}>
            <div className="p-2">
                <TypedMessageRender message={message} />
            </div>

            <Suspense fallback={<p className="p-2">Plugin is loading...</p>}>
                <PluginRender message={message} />
            </Suspense>
        </RegistryContext.Provider>
    );
}
