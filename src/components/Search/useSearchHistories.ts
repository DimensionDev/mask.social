import { take, uniq } from 'lodash-es';
import { useCallback, useState } from 'react';

import { EMPTY_LIST } from '@/constants/index.js';

function read() {
    const records = localStorage.getItem('@firefly/search');
    return records ? (JSON.parse(records) as string[]) : EMPTY_LIST;
}

function write(records: string[]) {
    localStorage.setItem('@firefly/search', JSON.stringify(records));
}

export function useSearchHistories() {
    const [histories, setHistories] = useState(read);
    const addRecord = useCallback((record: string) => {
        if (!record) return;
        setHistories((histories) => {
            const records = take(uniq([record, ...histories]), 5);
            write(records);
            return records;
        });
    }, []);
    const removeRecord = useCallback((record: string) => {
        setHistories((histories) => {
            const records = histories.filter((x) => x !== record);
            write(records);
            return records;
        });
    }, []);
    const clearAll = useCallback(() => {
        write(EMPTY_LIST);
        setHistories(EMPTY_LIST);
    }, []);

    return {
        histories,
        setHistories,
        addRecord,
        removeRecord,
        clearAll,
    };
}
