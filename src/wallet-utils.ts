import { RawWalletSummary } from './request-types';
import { CoinData, Denom, NetID, Transaction, TxKind } from './themelio-types';
import { map_from_entries, random_hex_string } from './utils';
import { Wallet, PreparedTransaction, WalletSummary } from './wallet-types';

export function int_to_netid(num: bigint): NetID {
  if (num === BigInt(NetID.Mainnet)) return NetID.Mainnet;
  if (num === BigInt(NetID.Testnet)) return NetID.Testnet;
  return NetID.Custom02;
}

export function string_to_denom(str: string): Denom {
  if (str == 'MEL') return Denom.MEL;
  if (str == 'SYM') return Denom.SYM;
  return Denom.ERG;
}

export function hex_to_denom(hex: string): Denom {
  let denom_val = Number(hex);
  return number_to_denom(denom_val);
}

export function number_to_denom(num: number): Denom {
  if (num == 109) return Denom.MEL;
  if (num == 115) return Denom.SYM;
  if (num == 100) return Denom.ERG;
  return Denom.CUSTOM;
}

export async function prepare_faucet(wallet: Wallet): Promise<Transaction> {
  let address = await wallet.get_address();
  let data = random_hex_string(32);
  let outputs: CoinData[] = [
    {
      covhash: address,
      value: 1001000000n,
      denom: Denom.MEL,
      additional_data: '',
    },
  ];
  let tx: Transaction = {
    kind: TxKind.Faucet,
    inputs: [],
    outputs: outputs,
    covenants: [],
    data,
    fee: 1001000000n,
    sigs: [],
  };
  return tx;
}

export function wallet_summary_from_raw(
  raw_summary: RawWalletSummary,
): WalletSummary {
  let { total_micromel, staked_microsym, address, locked } = raw_summary;
  let network: NetID = int_to_netid(raw_summary.network);

  let balance_entries: [string, bigint][] = Object.entries(
    raw_summary.detailed_balance,
  );

  let detailed_balance: Map<Denom, bigint> = map_from_entries(
    balance_entries.map(entry => {
      let [key, value]: [string, bigint] = entry;
      let mapped: [Denom, bigint] = [hex_to_denom('0x' + key), value];
      return mapped;
    }) as [Denom, bigint][],
  );

  let summary: WalletSummary = {
    total_micromel,
    detailed_balance,
    staked_microsym,
    network,
    address,
    locked,
  };
  return summary;
}
