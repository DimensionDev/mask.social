'use client';

import { memo } from 'react';

import { Link } from '@/esm/Link.js';

export const formatMentionTitle = (title: string) => {
    if (title.startsWith('@lens/')) return title.replace('@lens/', '@');

    return title;
};
export const MentionLink = memo<{ title: string; link: string }>(function MentionLink({ title, link }) {
    if (!title) return null;

    return (
        <Link href={link} className="text-link" onClick={(event) => event.stopPropagation()}>
            {formatMentionTitle(title)}
        </Link>
    );
});
