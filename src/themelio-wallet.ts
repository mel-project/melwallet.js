import {
  CoinData,
  CoinID,
  Denom,
  Header,
  NetID,
  PoolKey,
  PoolState,
  StakeDoc,
  Transaction,
  TxKind,
} from './themelio-types'
import { PrepareTransaction, TransactionStatus, Wallet, WalletSummary } from './wallet-types'
import { assertType, is } from 'typescript-is'
import {
  main_reviver,
  fetch_wrapper,
  map_from_entries,
  unwrap_nullable_promise
} from './utils'
import { RawWalletSummary, UnsafeMelwalletdResponse } from './request-types'
import { hex_to_denom, int_to_netid, send_faucet, string_to_denom } from './wallet-utils'


export class MelwalletdClient {
  readonly #domain: string
  constructor(domain: string) {
    this.#domain = domain
  }

  static async request(domain: string, endpoint: string, metadata?: any): Promise<string> {
    let url = `http://${domain}` + endpoint;
    let response = await fetch_wrapper(url, metadata)
    if (response.ok) {
      let data = await response.text()
      return data
    } else {
      throw new Error(`Error fetching \`${url}\`:\n\t${response.statusText}\n`)
    }
  }


  async request(endpoint: string, metadata?: any): Promise<string> {
    return MelwalletdClient.request(this.#domain, endpoint, metadata)
  }

  async list_wallets(): Promise<Map<string, WalletSummary>> {
    let res = await this.request('/wallets')
    return new Map()
  }
  async get_wallet(wallet_name: string): Promise<ThemelioWallet | null> {
    let data: string = await this.request(`/wallets/${wallet_name}`)
    let summary = JSON.parse(data);
    // let isWalletSummary = createIs<WalletSummary>();
    if (summary?.address) {
      let { address } = summary
      let domain = this.#domain
      let name = wallet_name
      return new ThemelioWallet(address, name, domain)
    }
    return null
  }
  async create_wallet(name: string, password: string | null, secret: string | null): Promise<void> {
    throw new Error('Method not implemented.')
  }
  async get_pool(pool: PoolKey): Promise<PoolState> {
    throw new Error('Method not implemented.')
  }
  async get_summary(): Promise<Header> {
    throw new Error('Method not implemented.')
  }
}

export class ThemelioWallet implements Wallet {
  address: string
  #domain: string
  readonly #name: string

  constructor(address: string, name: string, domain: string) {
    this.address = address
    this.#name = name
    this.#domain = domain
  }

  async prepare_transaction(prepare_tx: PrepareTransaction): Promise<Transaction> {
    
    let maybe_tx: any = await this.melwalletd_request("", {
      method: "POST",
      body: JSON.stringify(prepare_tx)
    })

    // if(is<Transaction>(maybe_tx)){
    //   return maybe_tx
    // }
    throw Error("Failed to find transaction")
  }

  async get_summary(): Promise<WalletSummary> {
    let raw_summary: RawWalletSummary = await this.melwalletd_request("");
    assertType<RawWalletSummary>(raw_summary);
    console.log(raw_summary);
    let {total_micromel, staked_microsym, address, locked} = raw_summary;
    let network: NetID = int_to_netid(raw_summary.network);
    
    
    let balance_entries: [string, bigint][] = Object.entries(raw_summary.detailed_balance)
    
    let detailed_balance: Map<Denom, bigint> = map_from_entries(balance_entries.map(entry=>{
      
      let [key, value]: [string, bigint] = entry;
      let mapped: [Denom, bigint] = [hex_to_denom("0x"+key),value]
      return mapped;
    
    }) as [Denom, bigint][])
    
    
    let summary: WalletSummary = {
      total_micromel,
      detailed_balance,
      staked_microsym,
      network,
      address,
      locked
    }

    return summary
    
  }
  async get_name(): Promise<string> {
    return this.#name
  }

  async get_address(): Promise<string> {
    return this.address;
  }

  // async get_coins(): Promise<Map<CoinID, CoinData>> {
  //   let wallet = this
  //   let coins: [CoinID, CoinData][] = await wallet.melwalletd_request('/coins')
  //   return map_from_entries(coins);
  // }

  async get_balances(): Promise<Map<Denom, bigint>> {
    let summary: WalletSummary = await this.get_summary();
    return summary.detailed_balance;
  }

  async lock(): Promise<void> {
    return this.melwalletd_request_raw("/lock", {
      method: "POST"
    })
  }
  async unlock(password?: string): Promise<void> {
    password = password || "";
    return this.melwalletd_request_raw("/unlock", {
      method: "POST",
      body: JSON.stringify({ password })
    })

  }
  async export_sk(password?: string): Promise<string> {
    password = password || "";
    return this.melwalletd_request_raw("/export-sk", {
      method: "POST",
      body: JSON.stringify({ password })
    })

  }

  async send_faucet(): Promise<string> {
    let wallet: Wallet = this;
    return send_faucet(wallet)
  }
  async send_tx(tx: Transaction): Promise<string> {
    throw new Error('Method not implemented.')
  }

  async get_transaction_status(txhash: string): Promise<TransactionStatus> {

    throw new Error('Method not implemented.')
  }

  async melwalletd_request(endpoint: any, metadata?: any): Promise<any> {
    let wallet = this
    let data = await MelwalletdClient.request(`${wallet.#domain}/wallets/${wallet.#name}`, endpoint, metadata);
    return JSON.parse(data, main_reviver);

  }
  async melwalletd_request_raw(endpoint: any, metadata?: any): Promise<any> {
    let wallet = this
    return MelwalletdClient.request(`${wallet.#domain}/wallets/${wallet.#name}`, endpoint, metadata);

  }
}



