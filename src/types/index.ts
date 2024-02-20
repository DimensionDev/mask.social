import type { FireflyRedPacketAPI } from '@masknet/web3-providers/types';

import { ServerErrorCodes } from '@/helpers/createErrorResponseJSON.js';
import type { IPFSResponse } from '@/services/uploadToIPFS.js';

export type ResponseJSON<T> =
    | {
          success: true;
          data: T;
      }
    | {
          success: false;
          error: {
              code: ServerErrorCodes;
              message: string;
          };
      };

export interface MediaObject {
    file: File;
    ipfs?: IPFSResponse;
    /** imgur url */
    imgur?: string;
}

export type ThemeMode = 'light' | 'dark' | 'default';

export enum Locale {
    en = 'en',
    zhHans = 'zh-Hans',
}

export type PartialWith<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>;

export interface RedpacketProps {
    payloadImage: string;
    claimRequirements: FireflyRedPacketAPI.StrategyPayload[];
}
