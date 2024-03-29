import { Trans } from '@lingui/macro';
import { Suspense, useState } from 'react';

import { ClickableButton } from '@/components/ClickableButton.js';
import { Loading } from '@/components/Loading.js';
import { ContentCollected } from '@/components/Profile/ContentCollected.js';
import { ContentFeed } from '@/components/Profile/ContentFeed.js';
import { SocialPlatform } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';

enum ContentType {
    Feed = 'Feed',
    Collected = 'Collected',
}

interface ContentTabsProps {
    profileId: string;
    source: SocialPlatform;
}
export function ContentTabs({ profileId, source }: ContentTabsProps) {
    const [currentTab, setCurrentTab] = useState(ContentType.Feed);

    // TODO: implement collected tab for farcaster
    const computedTab = source === SocialPlatform.Farcaster ? ContentType.Feed : currentTab;

    return (
        <>
            <div className=" flex gap-5 border-b border-lightLineSecond px-5 dark:border-line">
                {Object.values(ContentType)
                    .filter((x) => {
                        if (source === SocialPlatform.Farcaster) return x !== ContentType.Collected;
                        return true;
                    })
                    .map((tab) => (
                        <div key={tab} className=" flex flex-col">
                            <ClickableButton
                                className={classNames(
                                    ' flex h-[46px] items-center px-[14px] font-extrabold transition-all',
                                    computedTab === tab ? ' text-main' : ' text-third hover:text-main',
                                )}
                                onClick={() => setCurrentTab(tab)}
                            >
                                {tab === ContentType.Feed ? <Trans>Feed</Trans> : <Trans>Collected</Trans>}
                            </ClickableButton>
                            <span
                                className={classNames(
                                    ' h-1 w-full rounded-full bg-[#9250FF] transition-all',
                                    computedTab !== tab ? ' hidden' : '',
                                )}
                            />
                        </div>
                    ))}
            </div>

            {computedTab === ContentType.Feed && (
                <Suspense fallback={<Loading />}>
                    <ContentFeed source={source} profileId={profileId} />
                </Suspense>
            )}

            {computedTab === ContentType.Collected && source !== SocialPlatform.Farcaster && (
                <Suspense fallback={<Loading />}>
                    <ContentCollected source={source} profileId={profileId} />
                </Suspense>
            )}
        </>
    );
}
