import BigNumber from 'bignumber.js'
import type {
  CoinData,
  CoinID,
  Denom,
  Header,
  PoolKey,
  PoolState,
  StakeDoc,
  Transaction,
} from './themelio-types'
import { TransactionStatus, Wallet, WalletSummary } from './wallet-types'
import JSONBig from 'json-big'
import { fetch_wrapper, int_to_bigint, map_from_entries, unwrap_nullable_promise } from './utils'

class MelwalletdClient {
  readonly #domain: string
  constructor(domain: string) {
    this.#domain = domain
  }
  static async request<T>(domain: string, endpoint: string, metadata?: any): Promise<T> {
    let response = await fetch_wrapper(`http://${domain}` + endpoint, metadata)
    if (response.ok) {
      let data = await response.text()
      let json = JSONBig.parse(data, int_to_bigint)
      return json
    } else {
      throw new Error(response.statusText)
    }
  }

  async request<T>(endpoint: string, metadata?: any): Promise<T> {
    return MelwalletdClient.request(this.#domain, endpoint, metadata)
  }

  async list_wallets(): Promise<Map<String, WalletSummary>> {
    let res = await this.request('/wallets')
    return new Map()
  }
  async get_wallet(wallet_name: string): Promise<ThemelioWallet | null> {
    let summary: WalletSummary = await this.request<WalletSummary>(`/wallets/${wallet_name}`)
    // let isWalletSummary = createIs<WalletSummary>();
    if (summary?.address) {
      let { address } = summary
      let domain = this.#domain
      let name = wallet_name
      return new ThemelioWallet(address, name, domain)
    }
    return null
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

export class ThemelioWallet implements Wallet {
  address: string
  #domain: string
  readonly #name: string

  constructor(address: string, name: string, domain: string) {
    this.address = address
    this.#name = name
    this.#domain = domain
  }
  async get_name(): Promise<String> {
    throw new Error('Method not implemented.')
  }

  async get_address(): Promise<String> {
    let res = this.melwalletd_request
    return ''
  }

  async get_coins(): Promise<Map<CoinID, CoinData>> {
    let wallet = this
    let coins: [CoinID, CoinData][] = await wallet.melwalletd_request('/coins')
    return map_from_entries(coins);
  }

  async get_balances(): Promise<Map<Denom, BigNumber>> {
    let coins = await this.get_coins()
    return get_balances(coins)
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
    let wallet = this
    return MelwalletdClient.request(`${wallet.#domain}/wallets/${wallet.#name}`, endpoint, data)
  }
}


async function get_balances(coin_info: Map<CoinID, CoinData>): Promise<Map<Denom, BigNumber>> {
  let denoms: Map<Denom, BigNumber> = new Map()
  for (let coin_data of coin_info.values()) {
    let denom = coin_data.denom
    let current_value: BigNumber = denoms.get(denom) || new BigNumber(0)
    let coin_value: BigNumber = coin_data.value
    denoms.set(denom, coin_value.plus(current_value))
  }

  return denoms
}
async function main() {
  let client = new MelwalletdClient('127.0.0.1:11773')
  unwrap_nullable_promise(client.get_wallet('shane'))
    .then(async (wallet: ThemelioWallet) => wallet.get_balances())
    .then(balances => console.log(balances))
    .catch((err) => console.log(err))
}
main()
