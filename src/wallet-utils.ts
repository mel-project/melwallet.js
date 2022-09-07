import { CoinData, Denom, NetID, Transaction, TxKind } from './themelio-types';
import { Wallet, PreparedTransaction } from './wallet-types';

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
  if(num == 109) return Denom.MEL
  if(num == 115) return Denom.SYM
  if(num == 100) return Denom.ERG
  return Denom.CUSTOM
  
}

export async function prepare_faucet(
  wallet: Wallet,
): Promise<PreparedTransaction> {
  let address = await wallet.get_address();
  let outputs: CoinData[] = [
    {
      covhash: address,
      value: 1001000000n,
      denom: Denom.MEL,
      additional_data: '',
    },
  ];
  let ptx: PreparedTransaction = {
    kind: TxKind.Faucet,
    inputs: [],
    outputs: outputs,
    covenants: [],
    data: '',
    nobalance: [],
    fee_ballast: 0n,
    signing_key: null,
  };
  return ptx;
}
