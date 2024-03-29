import '@/mask/background-worker/plugin-register.js';

import {
    createIndexedDB_KVStorageBackend,
    createInMemoryKVStorageBackend,
    setupMaskKVStorageBackend,
} from '@masknet/shared-base';

import { broadcastMessage } from '@/mask/background-worker/message-port.js';

export const inMemoryStorageBackend = createInMemoryKVStorageBackend((key, value) => {
    broadcastMessage('inMemoryStorage', [key, value]);
});
export const indexedDBStorageBackend = createIndexedDB_KVStorageBackend('mask-plugin', (key, value) => {
    broadcastMessage('indexedDBStorage', [key, value]);
});
setupMaskKVStorageBackend(indexedDBStorageBackend, inMemoryStorageBackend);
