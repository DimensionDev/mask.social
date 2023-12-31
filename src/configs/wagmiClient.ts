'use client';

import { connectorsForWallets, getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { type FallbackTransport } from 'viem';
import { type Config, configureChains, createConfig, type PublicClient, type WebSocketPublicClient } from 'wagmi';
import {
    arbitrum,
    aurora,
    avalanche,
    base,
    bsc,
    type Chain,
    confluxESpace,
    fantom,
    gnosis,
    mainnet,
    optimism,
    polygon,
} from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

import { SITE_HOSTNAME, SITE_URL } from '@/constants/index.js';

export const appInfo: Parameters<typeof RainbowKitProvider>[0]['appInfo'] = {
    appName: SITE_HOSTNAME,
    learnMoreUrl: SITE_URL,
};

export const { chains, publicClient, webSocketPublicClient } = configureChains(
    [mainnet, base, polygon, optimism, bsc, arbitrum, gnosis, avalanche, aurora, confluxESpace, fantom],
    [publicProvider()],
) as {
    readonly chains: Chain[];
    readonly publicClient: (options: { chainId?: number | undefined }) => PublicClient<FallbackTransport>;
    readonly webSocketPublicClient: (options: {
        chainId?: number | undefined;
    }) => WebSocketPublicClient<FallbackTransport> | undefined;
};

const { wallets } = getDefaultWallets({
    appName: SITE_HOSTNAME,
    projectId: process.env.NEXT_PUBLIC_W3M_PROJECT_ID,
    chains,
});

export const connectors = connectorsForWallets([...wallets]);

export const config = createConfig({
    autoConnect: process.env.NODE_ENV !== 'test',
    connectors,
    publicClient,
    webSocketPublicClient,
}) as Config;
