import { getWalletClient } from 'wagmi/actions';
import { Session } from '@/providers/types/Session';
import { BaseSession } from '@/providers/base/Session';
import { Type } from '@/providers/types/SocialMedia';
import { generateCustodyBearer } from '@/helpers/generateCustodyBearer';
import { createLensClient } from '@/helpers/createLensClient';

export class LensSession extends BaseSession implements Session {
    constructor(
        public profileId: string,
        public token: string,
        public createdAt: number,
        public expiresAt: number,
        private client = createLensClient(),
    ) {
        super(Type.Lens, profileId, token, createdAt, expiresAt);
    }

    async refresh(): Promise<void> {
        const client = await getWalletClient();
        if (!client) throw new Error('No client found');

        const { payload } = await generateCustodyBearer(client);

        const address = client.account.address;

        const profile = await this.client.profile.fetchDefault({
            for: address,
        });

        const { id, text } = await this.client.authentication.generateChallenge({
            for: profile?.id,
            signedBy: address,
        });

        const signature = await client.signMessage({
            message: text,
        });

        await this.client.authentication.authenticate({
            id,
            signature,
        });

        const accessTokenResult = await this.client.authentication.getAccessToken();
        const accessToken = accessTokenResult.unwrap();

        this.token = accessToken;
        this.createdAt = payload.params.timestamp;
        this.expiresAt = payload.params.expiresAt;
    }

    async destroy(): Promise<void> {
        await this.client.authentication.logout();

        this.expiresAt = 0;
    }
}
