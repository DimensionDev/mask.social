import { WalletConnectQRCodeModal } from '@masknet/shared';
import { EMPTY_ARRAY } from '@masknet/shared-base';
import { initWallet as setup } from '@masknet/web3-providers';
import type { WalletAPI } from '@masknet/web3-providers/types';

async function reject(): Promise<never> {
    throw new Error('Not implemented');
}

export function initWallet(argument) {
    const WalletIO: WalletAPI.IOContext = {
        wallets: EMPTY_ARRAY,
        hasPaymentPassword: reject,
        openPopupWindow: reject,
        openWalletConnectDialog: async (uri: string) => {
            await WalletConnectQRCodeModal.openAndWaitForClose({
                uri,
            });
        },
        closeWalletConnectDialog: () => {
            WalletConnectQRCodeModal.close();
        },
        grantEIP2255Permission: reject,
        disconnectAllWalletsFromOrigin: reject,
        selectMaskWalletAccount: reject,
        addWallet: reject,
        signWithPersona: reject,
        send: reject,
    };
    return setup(WalletIO);
}
