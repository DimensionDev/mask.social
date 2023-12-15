import { delay } from '@masknet/kit';
import urlcat from 'urlcat';

import { WARPCAST_ROOT_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';

/**
 * Waits for a signed key request to reach a specified state.
 * @param signal - An optional AbortSignal to allow aborting the operation.
 * @returns An asynchronous function that waits for the signed key request to complete.
 */
export function waitForSignedKeyRequest(signal?: AbortSignal) {
    return async (
        token: string,
        state: 'pending' | 'completed' | 'approved' = 'approved',
        maxTries = 100,
        ms = 2000,
    ) => {
        let tries = 0;

        // eslint-disable-next-line no-constant-condition
        while (true) {
            // Check if the operation has been aborted
            if (signal?.aborted) throw new Error('Aborted');

            tries += 1;

            // Check if the maximum number of tries has been reached
            if (tries >= maxTries) throw new Error('Max tries reached');

            // Delay for a specified duration before checking again
            await delay(ms);

            // Fetch the signed key request status from the server
            const response = await fetchJSON<{
                result: { signedKeyRequest: { state: 'pending' | 'completed' | 'approved' } };
                errors?: Array<{ message: string }>;
            }>(
                urlcat(WARPCAST_ROOT_URL, '/signed-key-request', {
                    token,
                }),
            );

            // Continue the loop if there are errors in the response
            if (response.errors?.length) continue;

            // Check if the signed key request has reached the desired state
            if (response.result.signedKeyRequest.state === state) return true;
        }
    };
}