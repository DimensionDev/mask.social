'use client';

import type { LinkProps } from 'next/link.js';
import { memo } from 'react';

import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { formatUrl } from '@/helpers/formatUrl.js';
import { isSelfReference } from '@/helpers/isLinkMatchingHost.js';
import { parseURL } from '@/helpers/parseURL.js';

interface ExternalLinkProps extends Omit<LinkProps, 'href'> {
    title: string;
}

export const ExternalLink = memo<ExternalLinkProps>(function ExternalLink({ title }) {
    if (!title) return null;

    const u = parseURL(title);

    if (!u) return <span className={classNames('text-link')}> {title ? formatUrl(title, 30) : title}</span>;
    return (
        <Link
            onClick={(event) => event.stopPropagation()}
            href={u.href}
            title={u.href}
            className={classNames('text-link', {
                'hover:underline': !!u,
            })}
            target={!isSelfReference(u.href) ? '_blank' : '_self'}
        >
            {title ? formatUrl(title, 30) : title}
        </Link>
    );
});
