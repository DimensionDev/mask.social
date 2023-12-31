declare let self: ServiceWorkerGlobalScope;

const impressionsEndpoint = '/api/impressions';
const publicationsVisibilityInterval = 5000;
let viewerId: string | null = null;
const visiblePublicationsSet = new Set();

const sendVisiblePublicationsToServer = () => {
    const publicationsToSend = Array.from(visiblePublicationsSet);

    if (process.env.NODE_ENV === 'production' && publicationsToSend.length > 0 && viewerId) {
        visiblePublicationsSet.clear();
        fetch(impressionsEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                viewer_id: viewerId,
                ids: publicationsToSend,
            }),
            keepalive: true,
        })
            .then(() => {})
            .catch(() => {});
    }
};

setInterval(sendVisiblePublicationsToServer, publicationsVisibilityInterval);

const handleActivate = async (): Promise<void> => {
    await self.clients.claim();
};

self.addEventListener('message', (event) => {
    // Impression tracking
    if (event.data && event.data.type === 'PUBLICATION_VISIBLE') {
        visiblePublicationsSet.add(event.data.id);
        viewerId = event.data.viewerId;
    }
});

self.addEventListener('activate', (event) => event.waitUntil(handleActivate()));

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

export {};
