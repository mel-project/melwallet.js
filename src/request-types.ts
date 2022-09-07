export interface RawWalletSummary {
  total_micromel: bigint;
  detailed_balance: Record<string, bigint>;
  staked_microsym: bigint;
  network: bigint;
  address: string;
  locked: boolean;
}
