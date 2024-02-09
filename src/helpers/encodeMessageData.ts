import { FarcasterNetwork, Message, MessageData, NobleEd25519Signer } from '@farcaster/core';
import { blake3 } from '@noble/hashes/blake3';
import { toBytes } from 'viem';

import { farcasterClient } from '@/configs/farcasterClient.js';
import type { PartialWith } from '@/types/index.js';

export async function encodeMessageData(
    withMessageData: (profileId: number) => PartialWith<MessageData, 'type' | 'fid' | 'timestamp' | 'network'>,
    withMessage: (messageData: MessageData, signer: NobleEd25519Signer) => Promise<Message>,
    withPrivateKey?: string,
) {
    const { token, profileId } = farcasterClient.getSessionRequired();
    const privateKey = withPrivateKey || token;
    const signer = new NobleEd25519Signer(toBytes(privateKey));

    // @ts-ignore timestamp is not needed
    const messageData: MessageData = {
        ...withMessageData(Number.parseInt(profileId, 10)),
        fid: Number.parseInt(profileId, 10),
        network: FarcasterNetwork.MAINNET,
    };
    const messageDataBytes = MessageData.encode(messageData).finish();
    const messageDataHash = blake3(messageDataBytes, { dkLen: 20 });

    const message = await withMessage(messageData, signer);
    const messageBytes = Message.encode(message).finish();
    const messageHash = blake3(messageBytes, { dkLen: 20 });

    return {
        signer: `0x${Buffer.from((await signer.getSignerKey())._unsafeUnwrap()).toString('hex')}`,
        messageBytes: Buffer.from(messageBytes),
        messageHash,
        messageData,
        messageDataHash: `0x${Buffer.from(messageDataHash).toString('hex')}`,
        messageDataSignature: `0x${Buffer.from(
            (await signer.signMessageHash(messageDataHash))._unsafeUnwrap(),
        ).toString('hex')}`,
    } as const;
}
