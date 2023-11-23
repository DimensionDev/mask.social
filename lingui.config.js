import { formatter } from '@lingui/format-po';

const locales = ['en'];

if (process.env.NODE_ENV !== 'production') {
    locales.push('pseudo');
}

/** @type {import('@lingui/conf').LinguiConfig} */
export default {
    locales,
    sourceLocale: 'en',
    pseudoLocale: 'pseudo',
    catalogs: [
        {
            path: 'src/locales/{locale}/messages',
            include: ['src/app/**', 'src/components/**', 'src/helpers/**', 'src/hooks/**', 'src/providers/**'],
            exclude: ['src/maskbook/**'],
        },
    ],
    format: 'po',
    formatOptions: {
        origins: true,
        lineNumbers: false,
    },
    orderBy: 'messageId',
    format: formatter({ origins: false }),
};
