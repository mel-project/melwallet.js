import { assertType, createAssertType, is } from 'typescript-is';
import { MelwalletdProtocol, WalletGetter } from './melwalletd-prot';
import { JSONRPCResponse, JSONRPCSuccess, JSONRPC } from './types/jsonrpc'
import type { Denom } from './types/denom';
import {
  WalletSummary,
  SwapInfo,
  UnpreparedTransaction,
  TxBalance,
  TransactionStatus,
  ThemelioWallet,
} from './types/melwalletd-types';
import {
  Header,
  PoolKey,
  PoolState,
  CoinID,
  CoinData,
  Transaction,
  NetID,
} from './types/themelio-types';
import { JSONArray, JSONValue, ThemelioJson } from './utils/utils';
import { poolkey_to_str } from './utils/wallet-utils';

export class MelwalletdClient implements MelwalletdProtocol, WalletGetter<MelwalletdWallet> {
  readonly #base_url: string;
  constructor(url_or?: string, port_or?: number) {
    let url = url_or || 'http://127.0.0.1';
    let port = port_or || 11773;
    let base_url = url + ':' + port.toString();
    this.#base_url = base_url;
  }
  async get_wallet(name: string): Promise<MelwalletdWallet> {
    let client = this;
    let summary: WalletSummary = await this.wallet_summary(name);
    console.log('got summary ')
    return new MelwalletdWallet(summary.address, name, summary.network, client)
  }

  async list_wallets(): Promise<string[]> {
    let maybe_list: unknown = await this.rpc_request("list_wallets", [])
    return assertType<string[]>(maybe_list)
  }
  async wallet_summary(name: string): Promise<any> {
    console.log("getting summary")
    let res: unknown = await this.rpc_request("wallet_summary", [name])
    console.log(res)
    return assertType<WalletSummary>(res)
  }
  async latest_header(): Promise<Header> {
    let res: unknown = await this.rpc_request("latest_header", [])
    return assertType<Header>(res);
  }
  async melswap_info(pool_key: PoolKey): Promise<PoolState | null> {
    let res = await this.rpc_request("melswap_info", [poolkey_to_str(pool_key)])
    return assertType<PoolState | null>(res)
  }
  async simulate_swap(
    to: Denom,
    from: Denom,
    value: bigint,
  ): Promise<SwapInfo | null> {
    let unsafe_info = await this.rpc_request("simulate_swap", [to, from, value])
    return assertType<SwapInfo | null>(unsafe_info)

  }
  async create_wallet(
    wallet_name: string,
    password: string,
    secret?: string | undefined,
  ): Promise<void> {
    let wallet = await this.rpc_request("create_wallet", [wallet_name, password, secret || null])
  }
  async dump_coins(wallet_name: string): Promise<[CoinID, CoinData][]> {
    throw new Error('Method not implemented.');
  }
  async dump_transactions(wallet_name: string): Promise<[string, bigint | null][]> {
    throw new Error('Method not implemented.');
  }
  async lock_wallet(wallet_name: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async unlock_wallet(wallet_name: string, password: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async export_sk(wallet_name: string, password: string): Promise<string> {
    throw new Error('Method not implemented.');
  }
  prepare_tx(
    wallet_name: string,
    request: UnpreparedTransaction,
  ): Promise<Transaction> {
    throw new Error('Method not implemented.');
  }
  async send_tx(wallet_name: string, tx: Transaction): Promise<string> {
    throw new Error('Method not implemented.');
  }
  async tx_balance(wallet_name: string, txhash: string): Promise<TxBalance | null> {
    throw new Error('Method not implemented.');
  }
  tx_status(
    wallet_name: string,
    txhash: string,
  ): Promise<TransactionStatus | null> {
    throw new Error('Method not implemented.');
  }
  async send_faucet(wallet_name: string): Promise<string> {
    throw new Error('Method not implemented.');
  }


  /**
   * make a request to melwalletd
   * A `MelwalletdEndpoint` is just a string[] and an http method.
   * It's easy to construct these by hand, or you can use the `melwalletd_endpoints` helper object
   * @param  {string} melwalletd_url
   * @param  {MelwalletdEndpoint} endpoint
   * @param  {BodyInit} body
   * @param  {Omit<RequestInit, "method" | "body">} additional_options
   * @returns {Promise<Response>}
   */
  static async rpc_request(
    melwalletd_url: string,
    method: string,
    params: JSONValue,
  ): Promise<unknown> {
    let url = `${melwalletd_url}/`;
    let body = ThemelioJson.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method,
      params
    });
    try {
      let response = await fetch(url, {
        method: 'POST',
        body,
      });
      if (response.ok) {
        // console.log(body)
        let res: any = ThemelioJson.parse(await response.text())
        assertType<JSONRPCResponse>(res)
        return JSONRPC.extract_result(res)
      } else {
        console.debug(body);
        throw Error(`HTTP Error fetching \`${body} with ${response}`);
      }
    }
    catch {
      console.debug(body)
      throw Error(`Fetch failed, melwalletd may be offline`)
    }


  }



  /**
   * @param  {MelwalletdEndpoint} endpoint
   * @param  {string} [body]
   * @param  {Omit<RequestInit, "method" | "body">} [additional_options]
   * @returns {Promise<Response>}
   */
  async rpc_request(method: string, params: JSONArray): Promise<unknown> {
    return await MelwalletdClient.rpc_request(this.#base_url, method, params);
  }
}

export class MelwalletdWallet implements ThemelioWallet {
  readonly #address: string;
  readonly #client: MelwalletdClient;
  readonly #name: string;
  readonly #network: NetID;

  /**
   * constructs a wallet given a public key, name, network, and url of melwalletd
   * this constructor assumes that all these parameters are valid
   * use the `MelwalletdClient` instance method `get_wallet` for safe and consistent MelwalletdHttpWallet initialization
   *
   * @param  {string} address
   * @param  {string} name
   * @param  {NetID}  network
   * @param  {MelwalletdClient} client

   */
  constructor(
    address: string,
    name: string,
    network: NetID,
    client: MelwalletdClient,
  ) {
    console.log('creating new wallet')
    this.#address = address;
    this.#name = name;
    this.#client = client;
    this.#network = network;
  }
  get_name(): Promise<string> {
    throw new Error('Method not implemented.');
  }
  get_address(): Promise<string> {
    throw new Error('Method not implemented.');
  }
  get_network(): Promise<NetID> {
    throw new Error('Method not implemented.');
  }
  lock(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  unlock(password: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  export_sk(password: string): Promise<string | null> {
    throw new Error('Method not implemented.');
  }
  send_tx(tx: Transaction): Promise<string> {
    throw new Error('Method not implemented.');
  }
  prepare_transaction(ptx: UnpreparedTransaction): Promise<Transaction> {
    throw new Error('Method not implemented.');
  }
  get_transaction(txhash: string): Promise<Transaction> {
    throw new Error('Method not implemented.');
  }
  get_balances(): Promise<Record<'MEL' | 'SYM' | 'ERG' | '(NEWCOIN)' | `CUSTOM-${string}`, bigint>> {
    throw new Error('Method not implemented.');
  }

  /// MELWALLETD SPECIFICS 

  async get_summary(): Promise<any> {
    let res: WalletSummary = await this.#client.wallet_summary(await this.get_name())
    return res
  }
}
