import { assertType } from 'typescript-is';
import { MelwalletdProtocol, ThemelioWallet, WalletGetter } from './types/melwalletd-prot';
import { JSONRPCResponse, JSONRPC } from './types/jsonrpc'
import type { Denom } from './types/denom';
import {
  WalletSummary,
  SwapInfo,
  PrepareTxArgs,
  TxBalance,
  TransactionStatus,
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
import { JSONArray, JSONValue } from './utils/type-utils';
import { ThemelioJson } from './utils/utils';

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
    return new MelwalletdWallet(summary.address, name, summary.network, client)
  }

  async list_wallets(): Promise<string[]> {
    let maybe_list: unknown = await this.rpc_request("list_wallets", [])
    return assertType<string[]>(maybe_list)
  }
  async wallet_summary(name: string): Promise<any> {

    let res: unknown = await this.rpc_request("wallet_summary", [name])
    return assertType<WalletSummary>(res)
  }
  async latest_header(): Promise<Header> {
    let res: unknown = await this.rpc_request("latest_header", [])
    return assertType<Header>(res);
  }
  async melswap_info(pool_key: PoolKey): Promise<PoolState | null> {
    let res = await this.rpc_request("melswap_info", [PoolKey.asString(pool_key)])
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
    const res = await this.rpc_request("dump_coins", [wallet_name]);
    return assertType<[CoinID, CoinData][]>(res)

  }
  async dump_transactions(wallet_name: string): Promise<[string, bigint | null][]> {
    const res = await this.rpc_request("dump_transactions", [wallet_name]);
    return assertType<[string, bigint | null][]>(res)

  }
  async lock_wallet(wallet_name: string): Promise<void> {
    await this.rpc_request("lock_wallet", [wallet_name]);

  }
  async unlock_wallet(wallet_name: string, password: string): Promise<void> {
    await this.rpc_request("unlock_wallet", [wallet_name, password]);


  }
  async export_sk(wallet_name: string, password: string): Promise<string> {
    const res = await this.rpc_request("export_sk", [wallet_name, password]);
    return assertType<string>(res)

  }
  async prepare_tx(
    wallet_name: string,
    request: PrepareTxArgs,
  ): Promise<Transaction> {
    console.log(wallet_name, request)
    const res = await this.rpc_request("prepare_tx", [wallet_name, request]);
    return assertType<Transaction>(res)

  }
  async send_tx(wallet_name: string, tx: Transaction): Promise<string> {
    const res = await this.rpc_request("send_tx", [wallet_name, tx]);

    return assertType<string>(res)

  }
  async tx_balance(wallet_name: string, txhash: string): Promise<TxBalance | null> {
    const res = await this.rpc_request("tx_balance", [wallet_name, txhash]);
    return assertType<TxBalance | null>(res)

  }
  async tx_status(
    wallet_name: string,
    txhash: string,
  ): Promise<TransactionStatus | null> {
    const res = await this.rpc_request("tx_status", [wallet_name, txhash]);
    return assertType<TransactionStatus | null>(res)

  }
  async send_faucet(wallet_name: string): Promise<string> {
    const res = await this.rpc_request("send_faucet", [wallet_name]);
    return assertType<string>(res)

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
    let response = await fetch(url, {
      method: 'POST',
      body,
    });
    if (response.ok) {
      let res: any = ThemelioJson.parse(await response.text())
      assertType<JSONRPCResponse>(res)
      return JSONRPC.extract_result(res)
    } else {
      console.debug(body);
      throw Error(`HTTP Error fetching \`${body} with ${response}`);
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

    this.#address = address;
    this.#name = name;
    this.#client = client;
    this.#network = network;
  }
  async get_name(): Promise<string> {
    return this.#name;
  }
  async get_address(): Promise<string> {
    return this.#address
  }
  async get_network(): Promise<NetID> {
    return (await this.#client.latest_header()).network
  }
  async lock(): Promise<boolean> {
    this.#client.lock_wallet(await this.get_name())
    return true
  }
  async unlock(password: string): Promise<boolean> {
    this.#client.unlock_wallet(await this.get_name(), password)
    return true;
  }
  async export_sk(password: string): Promise<string | null> {
    return this.#client.export_sk(await this.get_name(), password);
  }
  async send_tx(tx: Transaction): Promise<string> {
    let txhash = await this.#client.send_tx(await this.get_name(), tx)
    return assertType<string>(txhash)
  }
  async prepare_transaction(ptx: PrepareTxArgs): Promise<Transaction> {
    return this.#client.prepare_tx(await this.get_name(), ptx)
  }
  async tx_status(txhash: string): Promise<TransactionStatus | null> {
    const status = this.#client.tx_status(await this.get_name(), txhash)
    return status
  }
  async get_balances(): Promise<Partial<Record<Denom, bigint>>> {
    return (await this.get_summary()).detailed_balance
  }

  /// MELWALLETD SPECIFICS 

  async get_summary(): Promise<WalletSummary> {
    let res: WalletSummary = await this.#client.wallet_summary(await this.get_name())

    return res
  }
}
