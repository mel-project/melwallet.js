import { CoinData, CoinID } from './themelio-types';
import { JSONObject } from './utils';

export interface RawWalletSummary {
  total_micromel: bigint;
  detailed_balance: Record<string, bigint>;
  staked_microsym: bigint;
  network: bigint;
  address: string;
  locked: boolean;
}

export interface RawTransaction {
  kind: bigint;
  inputs: CoinID[];
  outputs: CoinData[];
  fee: bigint;
  covenants: string[];
  data: string;
  sigs: string[];
}
