import { CoinData, Denom, NetID, Transaction, TxKind } from './themelio-types';
import { Wallet, PrepareTransaction } from './wallet-types';

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

export function number_to_denom(num: Number): Denom {
  (Object.values(Denom) as Array<keyof typeof Denom>).findIndex(key => {});
  throw Error();
}

export async function send_faucet(wallet: Wallet): Promise<string> {
  let outputs: CoinData[] = [
    {
      covhash: await wallet.get_address(),
      value: 1001000000n,
      denom: Denom.MEL,
      additional_data: '',
    },
  ];

  let ptx: PrepareTransaction = {
    kind: TxKind.Faucet,
    inputs: [],
    outputs: outputs,
    covenants: [],
    data: '',
    nobalance: [],
    fee_ballast: 0n,
    signing_key: null,
  };
  let tx: Transaction = await wallet.prepare_transaction(ptx);
  return await wallet.send_tx(tx);
}
