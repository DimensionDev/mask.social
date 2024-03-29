import { defineConfig } from 'vitest/config';

function createURL(pathToFile: string) {
    return new URL(pathToFile, import.meta.url).pathname;
}

export default defineConfig({
    test: {
        include: ['./tests/**/*.ts'],
        exclude: ['./tests/**/*.d.ts'],
        alias: {
            '@masknet/web3-shared-base': createURL('./src/maskbook/packages/web3-shared/base/src/index.ts'),
            '@': createURL('./src'),
        },
        setupFiles: ['./setups/index.ts'],
    },
});
