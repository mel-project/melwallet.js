import BigNumber from 'bignumber.js'
import type {
  CoinData,
  CoinID,
  Covenant,
  Denom,
  Header,
  NetID,
  Obj,
  PoolKey,
  PoolState,
  StakeDoc,
  Transaction,
  TxKind,
  WalletCoins,
  WalletSummary,
} from './themelio-types'
import { TransactionStatus, Wallet } from './wallet-types'
import fetch from 'node-fetch'
import {Response} from 'node-fetch'
import { assertType, is } from 'typescript-is'
import { AnyTxtRecord } from 'dns'
import JSONBig from 'json-big';

class MelwalletdClient{
  readonly #address: string;
  constructor(address: string){
    this.#address = address;
    
  }
  async request(endpoint: string, method?: string): Promise<Response> {
    method = method || "GET"
    return fetch(`${this.#address}` + endpoint, {
      method
    })
  }
  async list_wallets(): Promise<Map<String,WalletSummary>> {
    let res = await this.request("/wallets")
    return new Map()
  }
  async get_wallet(wallet_name: string): Promise<ThemelioWallet | null> {
    throw new Error('Method not implemented.')
  }
  async create_wallet(name: string, password: String | null, secret: String | null): Promise<void> {
    throw new Error('Method not implemented.')
  }
  async get_pool(pool: PoolKey): Promise<PoolState> {
    throw new Error('Method not implemented.')
  }
  async get_summary(): Promise<Header> {
    throw new Error('Method not implemented.')
  }

}

class ThemelioWallet implements Wallet {
  #domain: string
  readonly #name: string
  
  constructor(name: string, domain: string){
    this.#name = name;
    this.#domain = domain;
  } 
  async get_name(): Promise<String> {
    throw new Error('Method not implemented.')
  }

  async get_address(): Promise<String> {
    let res = this.melwalletd_request
    return ''
  }
  async get_balances(): Promise<[Denom, BigNumber][]> {
    let wallet = this
    let summary = await fetch_wrapper(`${wallet.#domain}/wallets/${wallet.#name}`)
    console.log(summary)
    return []
    throw new Error('Failed to get wallet summary')
  }
  async get_coins(): Promise<WalletCoins> {
    throw new Error('Method not implemented.')
  }
  async lock(): Promise<void> {
    throw new Error('Method not implemented.')
  }
  async unlock(password: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
  async export_sk(password: String | null): Promise<String> {
    throw new Error('Method not implemented.')
  }
  async send_faucet(): Promise<String> {
    throw new Error('Method not implemented.')
  }
  async send_tx(tx: Transaction): Promise<String> {
    throw new Error('Method not implemented.')
  }
  async prepare_stake_transaction(stake_doc: StakeDoc): Promise<Transaction> {
    throw new Error('Method not implemented.')
  }
  // async prepare_transaction(
  //   kind: TxKind,
  //   desired_inputs: Vec<CoinID>,
  //   desired_outputs: Vec<CoinData>,
  //   covenants: Vec<Covenant>,
  //   data: Vec<number>,
  //   no_balance: Vec<Denom>,
  //   fee_ballast: BigNumber
  // ): Promise<Transaction> {
  //   throw new Error('Method not implemented.')
  // }
  async get_transaction_status(txhash: String): Promise<TransactionStatus> {
    throw new Error('Method not implemented.')
  }
  async wait_transaction(txhash: String): Promise<BigNumber> {
    throw new Error('Method not implemented.')
  }
  async melwalletd_request<T>(endpoint: any, data?: any): Promise<any> {
    let response = await fetch_wrapper(`${this.#domain}` + endpoint, data)
    if (response.ok) {
      let data = response.text
      let json = JSONBig.parse(data)
      return json
    }
    else{
      throw new Error(response.statusText)
    }
  }
}

async function fetch_wrapper(endpoint: any, data?: any): Promise<Response> {
  data = data || {}
  let response = await fetch(endpoint, data)
  return response
  
}

// let wallet: ThemelioWallet = new ThemelioWallet('testing')

async function main() {
  let b = new Map()
  b.set("a", 1);
  console.log(b.entries());
  console.log(JSONBig.stringify(b.entries()));
  // console.log('what the heck')
  // let summary = await wallet.summarize_wallet()
  // console.log(summary)
}
main()
