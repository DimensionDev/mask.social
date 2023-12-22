import type { FunctionComponent, SVGAttributes } from 'react';

import LinkIcon from '@/assets/link.svg';
import { Link } from '@/esm/Link.js';

interface LinkCardProps {
    logo: FunctionComponent<SVGAttributes<SVGElement>>;
    link: string;
    content: string;
}

export function LinkCard({ logo: Icon, link, content }: LinkCardProps) {
    return (
        <Link
            href={link}
            className="inline-flex h-[48px] w-full items-center justify-start gap-[8px] rounded-lg bg-bottom px-[12px] py-[8px] shadow-accountCardShadowLight dark:shadow-accountCardShadowDark"
            style={{ backdropFilter: 'blur(8px)' }}
        >
            <Icon width={24} height={24} />
            <div className="inline-flex shrink grow basis-0 flex-col items-start justify-center gap-1">
                <div className=" text-[14px] font-bold leading-[18px] text-main">{content}</div>
            </div>
            <LinkIcon width={16} height={16} />
        </Link>
    );
}