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
  outputs: RawCoinData[];
  fee: bigint;
  covenants: string[];
  data: string;
  sigs: string[];
}


export type RawCoinData = Omit<CoinData, 'denom'> & {denom: string}
export type RawAnnCoinID = Omit<AnnCoinID, 'coin_data'> & {coin_data: RawCoinData}


export interface RawTransactionInfo {
  outputs: RawAnnCoinID[];
  confirmed_height: bigint | null;
  raw: RawTransaction;
}

export type RawTxBalance = [boolean, bigint, Record<string, bigint>];
