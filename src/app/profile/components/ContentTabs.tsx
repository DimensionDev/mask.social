import { useState } from 'react';

import ContentCollected from '@/app/profile/components/ContentCollected.js';
import ContentFeed from '@/app/profile/components/ContentFeed.js';
import { classNames } from '@/helpers/classNames.js';

enum TabEnum {
    Feed = 'Feed',
    Collected = 'Collected',
}

export default function ContentTabs() {
    const [tab, setTab] = useState<TabEnum>(TabEnum.Feed);

    return (
        <>
            <div className=" flex gap-5 border-b border-lightLineSecond px-5">
                {Object.values(TabEnum).map((tabName) => (
                    <div key={tabName} className=" flex flex-col">
                        <button
                            className={classNames(
                                ' flex h-[46px] items-center px-[14px] font-extrabold transition-all',
                                tab === tabName ? ' text-lightMain' : ' text-[#767F8D]',
                            )}
                            onClick={() => setTab(tabName)}
                        >
                            {tabName}
                        </button>
                        <span
                            className={classNames(
                                ' h-1 w-full rounded-full bg-[#1D9BF0] transition-all',
                                tab !== tabName ? ' hidden' : '',
                            )}
                        />
                    </div>
                ))}
            </div>

            {tab === TabEnum.Feed && <ContentFeed />}

            {tab === TabEnum.Collected && <ContentCollected />}
        </>
    );
}
