const { fetch: originalFetch } = globalThis;

export type Fetcher<T = Response> = (input: RequestInfo | URL, init?: RequestInit, next?: Fetcher) => Promise<T>;

export async function fetch(input: RequestInfo | URL, init?: RequestInit, fetchers: Fetcher[] = []): Promise<Response> {
    const fetcher = fetchers.reduceRight<Fetcher>(
        (ff, f) => (r, i) => f(r, i, ff),
        (input: RequestInfo | URL, init?: RequestInit | undefined) => {
            return originalFetch(input, {
                signal: AbortSignal.timeout(3 * 60 * 1000 /* 3 mins */),
                ...init,
            });
        },
    );

    // capture exception if bad response or any error occurs
    let hasError = false;
    let response: Response | undefined;

    try {
        response = await fetcher(input, init);
        if (!response.ok) hasError = true;
        return response;
    } catch (error) {
        hasError = true;
        throw error;
    }
}
