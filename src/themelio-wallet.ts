import {
  CoinData,
  CoinID,
  Denom,
  Header,
  PoolKey,
  PoolState,
  StakeDoc,
  Transaction,
  TxKind,
} from './themelio-types'
import { PrepareTransaction, TransactionStatus, Wallet, WalletSummary } from './wallet-types'
import JSONBig from 'json-big'
import { is } from 'typescript-is'
import {
  main_reviver,
  fetch_wrapper,
  map_from_entries,
  unwrap_nullable_promise
} from './utils'
import { RawWalletSummary, UnsafeMelwalletdResponse } from './request-types'

const JSON = JSONBig;




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
    let detailed_balance: Map<Denom, bigint> = new Map()
    console.log(raw_summary);
    console.log(is<RawWalletSummary>(raw_summary))

    throw Error()
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
      body: JSONBig.stringify({ password })
    })

  }
  async export_sk(password?: string): Promise<string> {
    password = password || "";
    return this.melwalletd_request_raw("/export-sk", {
      method: "POST",
      body: JSONBig.stringify({ password })
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

  async melwalletd_request<T extends UnsafeMelwalletdResponse>(endpoint: any, metadata?: any): Promise<T> {
    let wallet = this
    let data = await MelwalletdClient.request(`${wallet.#domain}/wallets/${wallet.#name}`, endpoint, metadata);
    return JSON.parse(data, main_reviver) as T;

  }
  async melwalletd_request_raw(endpoint: any, metadata?: any): Promise<any> {
    let wallet = this
    return MelwalletdClient.request(`${wallet.#domain}/wallets/${wallet.#name}`, endpoint, metadata);

  }
}




// async function send_faucet(): Promise<string> {
//   return this.melwalletd_request_raw("/send-faucet", {
//     method: "POST"
//   })
// }
async function main() {
  let client = new MelwalletdClient('127.0.0.1:11773')
  unwrap_nullable_promise(client.get_wallet('shane'))
    .then(async (wallet: ThemelioWallet) => {
      // console.log(`requesting to unlock: \`${await wallet.get_name()}\``);
      // await wallet.unlock("123")
      let summary = await wallet.get_summary();
      // console.log(summary)
      // console.log('unlocked');

      // console.log("pk: ", await wallet.export_sk("123"))
      // try {
      //   console.log("faucet? ", await wallet.send_faucet())
      // }
      // catch {
      //   console.log("sending faucet failed")
      // }
      // console.log('locking')
      // await wallet.lock()
      // let new_summary = await wallet.get_summary()
      // console.log("is locked: ", new_summary.locked)
      // console.log("how much money is in here: ", await wallet.get_balances())
    })
    // .then(balances => console.log(balances))
    .catch((err) => console.log(err))
}

async function send_faucet(wallet: Wallet): Promise<string> {
  let outputs: CoinData[] = [{
    covhash: await wallet.get_address(),
    value: 1001000000n,
    denom: Denom.MEL,
    additional_data: ""
  }]

  let ptx: PrepareTransaction = {
    kind: TxKind.Faucet,
    inputs: [],
    outputs: outputs,
    covenants: [],
    data: "",
    nobalance: [],
    fee_ballast: 0n,
    signing_key: null
  }
  let tx: Transaction = await wallet.prepare_transaction(ptx)
  return await wallet.send_tx(tx)
}

function new_issue() {


  const foreignObject: any = { someObject: 'obtained from the wild', without: 'type safety' };

  // if (is<MyInterface>(foreignObject)) { // returns true
  //   const someObject = foreignObject.someObject; // type: string
  //   const without = foreignObject.without; // type: string
  //   console.log("is my interface")
  // }
  // else {
  //   console.log("isn't my interface")
  // }

}
main() 
