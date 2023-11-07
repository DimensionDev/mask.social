import { LensClient, development, production } from '@lens-protocol/client';

export function createLensClient() {
    return new LensClient({
        environment: process.env.NODE_ENV === 'production' ? production : development,
    });
}
