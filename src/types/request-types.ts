import { AnnCoinID, CoinData, CoinID, TxKind } from './themelio-types';

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

export interface RawTransactionInfo {
  outputs: AnnCoinID[];
  confirmed_height: bigint | null;
  raw: RawTransaction;
}

export type RawTxBalance = [boolean, bigint, Record<string, bigint>];
