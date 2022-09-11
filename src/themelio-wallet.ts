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
} from './themelio-types';
import { PreparedTransaction, Wallet, WalletSummary } from './wallet-types';
import { assertType } from 'typescript-is';
import {
  ThemelioJson,
  map_from_entries,
  main_replacer,
  unwrap_nullable_promise,
  JSONObject,
  JSONValue,
  promise_or_false,
} from './utils';
import { RawTransaction, RawWalletSummary } from './request-types';
import {
  hex_to_denom,
  int_to_netid,
  prepare_faucet,
  wallet_summary_from_raw,
} from './wallet-utils';
import fetch from 'node-fetch';
import { assert } from 'console';

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

interface Endpoint {
  path: string[];
  method: HTTPMethod;
}

interface RequestError {
  message: string;
  response: Response;
}
let melwalletd_endpoints = {
  summary: (): Endpoint => ({
    path: [`summary`],
    method: HTTPMethod.GET,
  }),
  pools: (poolkey: PoolKey): Endpoint => ({
    path: [`pools`, poolkey.left, poolkey.right],
    method: HTTPMethod.GET,
  }),
  poolinfo: (): Endpoint => ({
    path: [`pool_info`],
    method: HTTPMethod.POST,
  }),
  wallet_list: (): Endpoint => ({
    path: [`wallets`],
    method: HTTPMethod.GET,
  }),
  wallet_summary: (name: string): Endpoint => ({
    path: [`wallets`, name],
    method: HTTPMethod.GET,
  }),
  create_wallet: (name: string): Endpoint => ({
    path: [`wallets`, name],
    method: HTTPMethod.PUT,
  }),
  lock_wallet: (name: string): Endpoint => ({
    path: [`wallets`, name, `lock`],
    method: HTTPMethod.POST,
  }),
  unlock_wallet: (name: string): Endpoint => ({
    path: [`wallets`, name, `unlock`],
    method: HTTPMethod.POST,
  }),
  export_sk: (name: string): Endpoint => ({
    path: [`wallets`, name, `export-sk`],
    method: HTTPMethod.POST,
  }),
  coins: (name: string): Endpoint => ({
    path: [`wallets`, name, `coins`],
    method: HTTPMethod.GET,
  }),
  prepare_tx: (name: string): Endpoint => ({
    path: [`wallets`, name, `prepare-tx`],
    method: HTTPMethod.POST,
  }),
  send_tx: (name: string): Endpoint => ({
    path: [`wallets`, name, `send-tx`],
    method: HTTPMethod.POST,
  }),
  send_faucet: (name: string): Endpoint => ({
    path: [`wallets`, name, `send-faucet`],
    method: HTTPMethod.POST,
  }),
  get_wallet_transaction_list: (name: string): Endpoint => ({
    path: [`wallets`, name, `transactions`],
    method: HTTPMethod.GET,
  }),
  get_wallet_transaction: (name: string, txhash: string): Endpoint => ({
    path: [`wallets`, name, `transactions`, txhash],
    method: HTTPMethod.GET,
  }),
  get_transaction_balance: (name: string, txhash: string): Endpoint => ({
    path: [`wallets`, name, `transactions`, txhash, `balance`],
    method: HTTPMethod.GET,
  }),
};
export class MelwalletdClient {
  readonly #domain: string;
  constructor(domain: string) {
    this.#domain = domain;
  }

  static async request(
    melwalletd_url: string,
    endpoint: Endpoint,
    body?: any,
    metadata?: any,
  ): Promise<string> {
    let { method, path } = endpoint;
    var str_endpoint = '';
    if (path.length > 0) {
      str_endpoint = '/' + path.join('/');
    }
    let url = `${melwalletd_url}` + str_endpoint;

    let response = await fetch(url, { ...metadata, method, body });
    let data = await response.text();
    if (response.ok) {
      return data;
    } else {
      throw {
        message: `Error fetching \`${method} => \`\`${url}\`:\n\t${response.statusText}\n`,
        response,
      };
    }
  }

  async request(
    endpoint: Endpoint,
    body?: any,
    metadata?: any,
  ): Promise<string> {
    return MelwalletdClient.request(this.#domain, endpoint, body, metadata);
  }

  async list_wallets(): Promise<Map<string, WalletSummary>> {
    let res = await this.request(melwalletd_endpoints.wallet_list());
    type RawWalletList = Record<string, RawWalletSummary>;
    let maybe_list = ThemelioJson.parse(res) as Object;
    assertType<RawWalletList>(maybe_list);
    let raw_summaries: RawWalletList = maybe_list as any;
    let entries: [string, WalletSummary][] = Object.entries(raw_summaries).map(
      ([key, value]) => [key, wallet_summary_from_raw(value)],
    );
    return map_from_entries(entries);
  }

  // assemble a wallet by it's name
  async get_wallet(wallet_name: string): Promise<MelwalletdWallet | null> {
    let data: string = await this.request(
      melwalletd_endpoints.wallet_summary(wallet_name),
    );
    let maybe_summary: Object = ThemelioJson.parse(data);
    assertType<RawWalletSummary>(maybe_summary);
    let summary = maybe_summary as any as WalletSummary;
    if (summary?.address) {
      let { address } = summary;
      let domain = this.#domain;
      let name = wallet_name;
      return new MelwalletdWallet(address, name, domain);
    }
    return null;
  }

  async create_wallet(
    name: string,
    password: string | null,
    secret: string | null,
  ): Promise<boolean> {
    try {
      let res = await this.request(
        melwalletd_endpoints.create_wallet(name),
        ThemelioJson.stringify({
          password,
          secret,
        }),
      );
      return true;
    } catch (e) {
      let err = e as RequestError;
      if (err.response.status === 500) {
        return false;
      }
      throw err.message;
    }
  }
  async get_pool(poolkey: PoolKey): Promise<PoolState> {
    let res = await this.request(melwalletd_endpoints.pools(poolkey));
    let maybe_pool: Object = ThemelioJson.parse(res);
    assertType<PoolState>(maybe_pool);
    let pool: PoolState = maybe_pool as any;
    return pool;
  }
  async get_summary(): Promise<Header> {
    let unsafe_header: any = ThemelioJson.parse(
      await this.request(melwalletd_endpoints.summary()),
    );
    unsafe_header.network = Number(unsafe_header.network);
    assertType<Header>(unsafe_header);
    let header: Header = unsafe_header!;
    return header;
  }
}

export class MelwalletdWallet implements Wallet {
  readonly #address: string;
  readonly #base_url: string;
  readonly #name: string;

  constructor(address: string, name: string, domain: string) {
    this.#address = address;
    this.#name = name;
    this.#base_url = domain;
  }
  async get_name(): Promise<string> {
    return this.#name;
  }

  async get_address(): Promise<string> {
    return this.#address;
  }

  async get_summary(): Promise<WalletSummary> {
    let name = this.#name;
    let res: JSONValue = (await this.melwalletd_request(
      melwalletd_endpoints.wallet_summary(name),
    )) as JSONValue;

    assertType<RawWalletSummary>(res);
    let raw_summary = res as any as RawWalletSummary;

    return wallet_summary_from_raw(raw_summary);
  }
  
  async get_network(): Promise<NetID> {
    let summary = await this.get_summary();
    let network: NetID = summary.network;
    return network;
  }

  async lock(): Promise<boolean> {
    let name = this.#name;
    try {
      this.melwalletd_request_raw(melwalletd_endpoints.lock_wallet(name));
      return true;
    } catch {
      return false;
    }
  }

  async unlock(password?: string): Promise<boolean> {
    password = password || '';
    let name = this.#name;
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

  async export_sk(password?: string): Promise<string> {
    password = password || '';
    let name = this.#name;
    return this.melwalletd_request_raw(
      melwalletd_endpoints.export_sk(name),
      ThemelioJson.stringify({ password }),
    );
  }

  async get_balances(): Promise<Map<Denom, bigint>> {
    let summary: WalletSummary = await this.get_summary();
    return summary.detailed_balance;
  }

  async prepare_transaction(
    prepare_tx: PreparedTransaction,
  ): Promise<Transaction> {
    let name = this.#name;
    let res: Object = await this.melwalletd_request(
      melwalletd_endpoints.prepare_tx(name),
      ThemelioJson.stringify(prepare_tx),
    );

    assertType<RawTransaction>(res);
    let raw_tx: RawTransaction = res as any as RawTransaction;
    let tx: Transaction = Object.assign({}, raw_tx, {
      kind: Number(raw_tx.kind),
    });

    return tx;
  }
  async send_faucet(): Promise<string> {
    let wallet: Wallet = this;
    let tx: Transaction = await prepare_faucet(wallet);
    return await this.send_tx(tx);
  }
  async send_tx(tx: Transaction): Promise<string> {
    let wallet = this;
    return this.melwalletd_request_raw(
      melwalletd_endpoints.send_tx(wallet.#name),
      ThemelioJson.stringify(tx),
    );
  }

  async get_transaction(txhash: string): Promise<Transaction> {
    let wallet = this;
    let name = wallet.#name;
    let maybe_tx = this.melwalletd_request(
      melwalletd_endpoints.get_wallet_transaction(name, txhash),
    );
    assertType<Transaction>(maybe_tx);
    let tx: Transaction = maybe_tx as any as Transaction;
    return tx;
  }

  async melwalletd_request(
    endpoint: Endpoint,
    body?: any,
    metadata?: any,
  ): Promise<JSONValue | Object> {
    let data = await this.melwalletd_request_raw(endpoint, body, metadata);
    return ThemelioJson.parse(data);
  }
  async melwalletd_request_raw(
    endpoint: Endpoint,
    body?: any,
    metadata?: any,
  ): Promise<string> {
    let wallet = this;
    return await MelwalletdClient.request(
      `${wallet.#base_url}`,
      endpoint,
      body,
      metadata,
    );
  }
}
