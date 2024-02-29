import type { OpenGraph } from '@/types/og.js';

class Loader {
    load(content: string): Promise<OpenGraph | null> {
        throw new Error('To be implemented.');
    }

    linearLoad(content: string): OpenGraph | null {
        throw new Error('To be implemented.');
    }
}

export const OpenGraphLoader = new Loader();
