import {
  WalletSummary,
  ThemelioWallet,
  UnpreparedTransaction,
  TransactionDump,
  TxBalance,
  SwapInfo,
} from './types/melwalletd-types';
import {
  RawWalletSummary,
  RawTransactionInfo,
  RawTransaction,
  RawTxBalance,
} from './types/request-types';
import {
  PoolKey,
  PoolState,
  Header,
  NetID,
  Transaction,
} from './types/themelio-types';
import { ThemelioJson, map_from_entries, JSONValue } from './utils/utils';
import {
  number_to_txkind,
  tx_from_raw,
  wallet_summary_from_raw,
} from './utils/wallet-utils';
import { assertType } from 'typescript-is';
import Denom, { DenomName, DenomNum } from './types/denom';

enum HTTPMethod {
  CONNECT = 'CONNECT',
  DELETE = 'DELETE',
  GET = 'GET',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
  PATCH = 'PATCH',
  POST = 'POST',
  PUT = 'PUT',
  TRACE = 'TRACE',
}

interface MelwalletdEndpoint {
  path: string[];
  method: HTTPMethod;
  body?: BodyInit;
}

interface RequestError {
  message: string;
  response: Response;
}
let melwalletd_endpoints = {
  summary: (): MelwalletdEndpoint => ({
    path: [`summary`],
    method: HTTPMethod.GET,
  }),
  pools: (poolkey: PoolKey): MelwalletdEndpoint => ({
    path: [`pools`, `${poolkey.left}:${poolkey.right}`],
    method: HTTPMethod.GET,
  }),
  simulate_swap: (
    from: DenomNum,
    to: DenomNum,
    value: bigint,
  ): MelwalletdEndpoint => ({
    path: [`pool_info`],
    body: ThemelioJson.stringify({ from, to, value }),
    method: HTTPMethod.POST,
  }),
  wallet_list: (): MelwalletdEndpoint => ({
    path: [`wallets`],
    method: HTTPMethod.GET,
  }),
  wallet_summary: (name: string): MelwalletdEndpoint => ({
    path: [`wallets`, name],
    method: HTTPMethod.GET,
  }),
  create_wallet: (name: string): MelwalletdEndpoint => ({
    path: [`wallets`, name],
    method: HTTPMethod.PUT,
  }),
  lock_wallet: (name: string): MelwalletdEndpoint => ({
    path: [`wallets`, name, `lock`],
    method: HTTPMethod.POST,
  }),
  unlock_wallet: (name: string): MelwalletdEndpoint => ({
    path: [`wallets`, name, `unlock`],
    method: HTTPMethod.POST,
  }),
  export_sk: (name: string): MelwalletdEndpoint => ({
    path: [`wallets`, name, `export-sk`],
    method: HTTPMethod.POST,
  }),
  coins: (name: string): MelwalletdEndpoint => ({
    path: [`wallets`, name, `coins`],
    method: HTTPMethod.GET,
  }),
  prepare_tx: (name: string): MelwalletdEndpoint => ({
    path: [`wallets`, name, `prepare-tx`],
    method: HTTPMethod.POST,
  }),
  send_tx: (name: string): MelwalletdEndpoint => ({
    path: [`wallets`, name, `send-tx`],
    method: HTTPMethod.POST,
  }),
  send_faucet: (name: string): MelwalletdEndpoint => ({
    path: [`wallets`, name, `send-faucet`],
    method: HTTPMethod.POST,
  }),
  get_wallet_transaction_list: (name: string): MelwalletdEndpoint => ({
    path: [`wallets`, name, `transactions`],
    method: HTTPMethod.GET,
  }),
  get_wallet_transaction: (
    name: string,
    txhash: string,
  ): MelwalletdEndpoint => ({
    path: [`wallets`, name, `transactions`, txhash],
    method: HTTPMethod.GET,
  }),
  get_transaction_balance: (
    name: string,
    txhash: string,
  ): MelwalletdEndpoint => ({
    path: [`wallets`, name, `transactions`, txhash, `balance`],
    method: HTTPMethod.GET,
  }),
};
export class MelwalletdClient {
  readonly #base_url: string;
  constructor(url_or?: string, port_or?: number) {
    let url = url_or || 'http://127.0.0.1';
    let port = port_or || 11773;
    let base_url = url + ':' + port.toString();
    this.#base_url = base_url;
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
  static async request(
    melwalletd_url: string,
    endpoint: MelwalletdEndpoint,
    body?: BodyInit,
    additional_options?: Omit<RequestInit, 'method' | 'body'>,
  ): Promise<Response> {
    if (endpoint.body && body) {
      throw 'Ambiguously specified body in both `body` and `endpoint`';
    }

    let { method, path } = endpoint;
    var str_endpoint = '';
    if (path.length > 0) {
      str_endpoint = '/' + path.join('/');
    }
    let request_body = endpoint.body ? endpoint.body : body;
    let url = `${melwalletd_url}` + str_endpoint;
    let response = await fetch(url, {
      ...additional_options,
      method,
      body: request_body,
    });
    if (response.ok) {
      return response;
    } else {
      console.debug(request_body)
      throw {
        message: `Error fetching \`${method} => \`${url}\`:\n\t${response.statusText}\n`,
        response,
      };
    }
  }
  /**
   * @param  {MelwalletdEndpoint} endpoint
   * @param  {string} [body]
   * @param  {Omit<RequestInit, "method" | "body">} [additional_options]
   * @returns {Promise<Response>}
   */
  async request(
    endpoint: MelwalletdEndpoint,
    body_or?: BodyInit,
    additional_options_or?: Omit<RequestInit, 'method' | 'body'>,
  ): Promise<Response> {
    let additional_options = additional_options_or || {};
    return MelwalletdClient.request(
      this.#base_url,
      endpoint,
      body_or,
      additional_options,
    );
  }
  /**
   * A list of all wallets represented as a mapping between the wallet's name to it's summary
   * @returns {Promise<Map<string, WalletSummary>>}
   */
  async list_wallets(): Promise<Map<string, WalletSummary>> {
    let res = await this.request(melwalletd_endpoints.wallet_list());
    let data: string = await res.text();
    type RawWalletList = Record<string, RawWalletSummary>;
    let maybe_list = ThemelioJson.parse(data) as Object;
    assertType<RawWalletList>(maybe_list);
    let raw_summaries: RawWalletList = maybe_list as RawWalletList;
    let entries: [string, WalletSummary][] = Object.entries(raw_summaries).map(
      ([key, value]) => [key, wallet_summary_from_raw(value)],
    );
    return map_from_entries(entries);
  }
  /**
   * get a wallet by it's name
   * @param  {string} wallet_name
   * @returns {Promise<MelwalletdWallet>}
   */
  async get_wallet(wallet_name: string): Promise<MelwalletdWallet> {
    let res = await this.request(
      melwalletd_endpoints.wallet_summary(wallet_name),
    );
    let data: string = await res.text();

    let maybe_summary: Object = ThemelioJson.parse(data);
    assertType<RawWalletSummary>(maybe_summary);
    let summary = maybe_summary as any as WalletSummary;
    if (summary?.address) {
      let { address } = summary;
      let name = wallet_name;
      return new MelwalletdWallet(address, name, summary.network, this);
    }
    throw `Unable to get Wallet ${wallet_name}`;
  }
  /**
   * create a new wallet
   * @param  {string} name
   * @param  {string} password
   *
   */
  async create_wallet(name: string, password: string): Promise<void> {
    let body = ThemelioJson.stringify({
      password,
      secret: undefined,
    });
    await this.request(melwalletd_endpoints.create_wallet(name), body);
  }
  /**
   * Import a wallet given a name, password, and secret key
   * @param  {string} name
   * @param  {string} password
   * @param  {string} secret
   */
  async import_wallet(
    name: string,
    password: string,
    secret: string,
  ): Promise<void> {
    let body = ThemelioJson.stringify({
      password,
      secret,
    });
    await this.request(melwalletd_endpoints.create_wallet(name), body);
  }
  /**
   * @param  {PoolKey} poolkey
   * @returns {Promise<PoolState>}
   */
  async get_pool(poolkey: PoolKey): Promise<PoolState> {
    let res = await this.request(melwalletd_endpoints.pools(poolkey));
    let data: string = await res.text();

    let maybe_pool: Object = ThemelioJson.parse(data);
    assertType<PoolState>(maybe_pool);
    let pool: PoolState = maybe_pool as any;
    return pool;
  }
  /**
   * @returns {Promise<Header>}
   */
  async get_summary(): Promise<Header> {
    let res = await this.request(melwalletd_endpoints.summary());
    let data: string = await res.text();
    ///TODO: Remove `any`
    let unsafe_header: any = ThemelioJson.parse(data);
    unsafe_header.network = Number(unsafe_header.network);
    assertType<Header>(unsafe_header);
    let header: Header = unsafe_header!;
    return header;
  }
  /**
   * TODO: FIX
   * @param  {string} name
   * @param  {string} txhash
   * @returns {Promise<RawTransactionInfo>}
   */
  async get_transaction(
    name: string,
    txhash: string,
  ): Promise<RawTransactionInfo> {
    let tx_endpoint = melwalletd_endpoints.get_wallet_transaction(name, txhash);
    let res = await this.request(tx_endpoint);
    let data = await res.text();
    let maybe_tx_info: Object = ThemelioJson.parse(data);
    assertType<RawTransactionInfo>(maybe_tx_info);
    return maybe_tx_info as RawTransactionInfo;
  }
  async simulate_swap(
    to: Denom,
    from: Denom,
    value: bigint,
  ): Promise<SwapInfo | null> {
    throw Error("broken handler: simulate_swap")
    let res = await this.request(
      melwalletd_endpoints.simulate_swap(to.toNum(), from.toNum(), value),
    );
    let data: string = await res.text();

    let maybe_pool: Object = ThemelioJson.parse(data);
    assertType<SwapInfo>(maybe_pool);
    let pool: SwapInfo = maybe_pool as any;
    return pool;
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
   * use the `MelwalletdClient` instance method `get_wallet` for safe and consistent MelwalletdWallet initialization
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
  /**
   * Get the name of this wallet
   * @returns {Promise<string>}
   */
  async get_name(): Promise<string> {
    return this.#name;
  }
  /**
   * Get the wallet's public key
   * @returns {Promise<string>}
   */
  async get_address(): Promise<string> {
    return this.#address;
  }
  /**
   * Get the NetID of the network to which this wallet belongs
   * @returns {Promise<NetID>}
   */
  async get_network(): Promise<NetID> {
    return this.#network;
  }
  /**
   * locks this wallet
   * returns true if the request completes successfully
   * @returns {Promise<boolean>}
   */
  async lock(): Promise<boolean> {
    let name = await this.get_name();
    try {
      this.melwalletd_request_raw(melwalletd_endpoints.lock_wallet(name));
      return true;
    } catch {
      return false;
    }
  }
  /**
   * unlocks this wallet given a password
   * returns true if the request completes successfully
   * @param  {string} [password]
   * @returns {Promise<boolean>}
   */
  async unlock(password?: string): Promise<boolean> {
    password = password || '';
    let name = await this.get_name();
    try {
      this.melwalletd_request_raw(
        melwalletd_endpoints.unlock_wallet(name),
        ThemelioJson.stringify({ password }),
      );
      return true;
    } catch {
      return false;
    }
  }
  /**
   * exports the wallets secret key
   * this needs the wallet password even if the wallet is unlocked
   * @param  {string} [password]
   * @returns {Promise<string>}
   */
  async export_sk(password?: string): Promise<string> {
    password = password || '';
    let name = await this.get_name();
    let res = await this.melwalletd_request_raw(
      melwalletd_endpoints.export_sk(name),
      ThemelioJson.stringify({ password }),
    );
    return res.text();
  }

  /**
   * @param  {UnpreparedTransaction} prepare_tx
   * @returns {Promise<Transaction>}
   */
  async prepare_transaction(
    prepare_tx: UnpreparedTransaction,
  ): Promise<Transaction> {
    let name = await this.get_name();
    let res: Object = await this.melwalletd_request(
      melwalletd_endpoints.prepare_tx(name),
      ThemelioJson.stringify(prepare_tx),
    );
    assertType<RawTransaction>(res);
    let raw_tx: RawTransaction = res as any as RawTransaction;
    let tx: Transaction = tx_from_raw(raw_tx);

    return tx;
  }

  /**
   * request transaction information
   * @param  {string} txhash
   * @returns {Promise<Transaction>}
   */
  async get_transaction(txhash: string): Promise<Transaction> {
    let wallet = this;
    let name = await wallet.get_name();
    let raw_tx_info = await this.#client.get_transaction(name, txhash);
    return tx_from_raw(raw_tx_info.raw);
  }

  /**
   * returns a map between a Denom and the amount of that denom in this wallet
   * @returns {Promise<Map<Denom,bigint>>}
   */
  async get_balances(): Promise<Map<Denom, bigint>> {
    let summary: WalletSummary = await this.get_summary();
    return summary.detailed_balance;
  }

  /**
   * send a transaction
   * @param  {Transaction} tx
   * @returns {Promise<string>}
   */
  async send_tx(tx: Transaction): Promise<string> {
    let wallet = this;
    let res = await this.melwalletd_request_raw(
      melwalletd_endpoints.send_tx(await wallet.get_name()),
      ThemelioJson.stringify(tx),
    );
    let unclean_txhash = await res.text();
    let txhash = unclean_txhash.replace(/"/g, '');
    // could assert type of each letter to be a hex string
    // txhash.forEach((c: string)=>assertType<HexChar>(c))
    return txhash;
  }
  /**
   * request transaction information
   * @param  {string} txhash
   * @returns {Promise<Transaction>}
   */
  async list_transactions(): Promise<TransactionDump> {
    let wallet = this;
    let name = await wallet.get_name();
    let get_all_transactions_endpoint =
      await melwalletd_endpoints.get_wallet_transaction_list(name);
    let raw_transactions = await this.melwalletd_request(
      get_all_transactions_endpoint,
    );
    assertType<TransactionDump>(raw_transactions);
    let dump: TransactionDump = raw_transactions as any;
    return dump;
  }
  /**
   * get transaction balance
   * @param  {string} txhash
   * @returns {Promise<Transaction>}
   */
  async get_transaction_balance(txhash: string): Promise<TxBalance> {
    let wallet = this;
    let name = await wallet.get_name();
    let get_transaction_balance_endpoint =
      await melwalletd_endpoints.get_transaction_balance(name, txhash);
    let raw_balance: RawTxBalance | TxBalance = (await this.melwalletd_request(
      get_transaction_balance_endpoint,
    )) as any;
    assertType<RawTxBalance>(raw_balance);
    /// we now know [boolean, bigint, Record<string, bigint>]
    raw_balance[1] = number_to_txkind(raw_balance[1] as bigint); // turn to txkind

    let raw_balances: [string, bigint][] = Object.entries(raw_balance[2] as Record<string, bigint>)

    let balances: [Denom, bigint][] = raw_balances.map(
      ([denom, value])=>{
        return [Denom.fromHex('0x'+denom), value]
      }
    )
    raw_balance[2] = map_from_entries(balances); // turn to map
    /// [boolean, TxKind, Map<string, bigint>]
    let balance: TxBalance = raw_balance as TxBalance;
    return balance;
  }
  /**
   * Get the associated WalletSummary
   * @returns {Promise<WalletSummary>}
   */
  async get_summary(): Promise<WalletSummary> {
    let name = await this.get_name();
    let res: JSONValue = (await this.melwalletd_request(
      melwalletd_endpoints.wallet_summary(name),
    )) as JSONValue;

    assertType<RawWalletSummary>(res);
    let raw_summary = res as any as RawWalletSummary;

    return wallet_summary_from_raw(raw_summary);
  }
  /**
   * submits a request to melwalletd and parses the request as a json object
   * @param  {MelwalletdEndpoint} endpoint
   * @param  {any} [body]
   * @param  {any} [additional_options]
   * @returns {Promise<JsonValue | Object>}
   */
  private async melwalletd_request(
    endpoint: MelwalletdEndpoint,
    body?: JSONValue,
    additional_options?: any,
  ): Promise<JSONValue | Object> {
    let wallet = this;
    let res = await wallet.melwalletd_request_raw(
      endpoint,
      body,
      additional_options,
    );
    let data = await res.text();
    return ThemelioJson.parse(data);
  }
  /**
   * submits a request to melwalletd
   * @param  {MelwalletdEndpoint} endpoint
   * @param  {any} [body]
   * @param  {any} [additional_options]
   * @returns {Promise<Response>}
   */
  private async melwalletd_request_raw(
    endpoint: MelwalletdEndpoint,
    body?: any,
    additional_options?: any,
  ): Promise<Response> {
    let wallet = this;
    return await wallet.#client.request(endpoint, body, additional_options);
  }
}
