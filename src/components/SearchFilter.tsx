'use client';

import { t } from '@lingui/macro';
import { usePathname } from 'next/navigation.js';
import { memo } from 'react';

import { SearchType } from '@/constants/enum.js';
import { useSearchStore } from '@/store/useSearchStore.js';

const Filters = [
    {
        type: SearchType.Posts,
        label: t`Publications`,
    },
    {
        type: SearchType.Profiles,
        label: t`Profiles`,
    },
];

interface SearchFilterProps {}

export const SearchFilter = memo(function SearchBar(props: SearchFilterProps) {
    const pathname = usePathname();
    const { searchType, updateSearchType } = useSearchStore();

    if (!pathname.startsWith('/search')) return null;

    return (
        <div>
            <div className=" my-6 rounded-xl bg-lightBg px-3 py-2.5 text-sm font-bold">
                <h1>Search Filter</h1>
            </div>
            <div className=" mt-4 rounded-xl border border-line">
                <fieldset className=" px-4 pb-1 pt-2">
                    {Filters.map((filter) => (
                        <div key={filter.type} className="flex items-center">
                            <label
                                htmlFor={filter.type}
                                className=" block flex-1 py-2 text-sm font-bold leading-6 dark:text-white"
                            >
                                {filter.label}
                            </label>
                            <input
                                id={filter.type}
                                name="notification-method"
                                type="radio"
                                defaultChecked={filter.type === searchType}
                                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                onClick={() => updateSearchType(filter.type)}
                            />
                        </div>
                    ))}
                </fieldset>
            </div>
        </div>
    );
});
