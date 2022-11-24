import {
  WalletSummary,
  SwapInfo,
  TxBalance,
  TransactionStatus as TxStatus,
  PrepareTxArgs,
} from './melwalletd';
import {
  Header,
  PoolState,
  CoinID,
  CoinData,
  Transaction,
  NetID,
  PoolKey,
  Denom,
} from './themelio-structs';

export interface WalletGetter<T extends ThemelioWallet> {
  get_wallet(name: string): Promise<T>;
}

export interface MelwalletdProtocol {
  /**
   * @returns Promise<string[]>
   * Returns a list of wallet names.
   */
  list_wallets(): Promise<string[]>;

  /**
   * @param  {string} wallet_name
   * @returns Promise<WalletSummary>
   *  Returns a summary of the overall state of the wallet. See [WalletSummary] for what that entails.
   */
  wallet_summary(wallet_name: string): Promise<WalletSummary>;

  /**
   * @returns Promise<Header>
   * Returns the latest blockchain header.
   */
  latest_header(): Promise<Header>;

  /**
   * @param  {PoolKey} pool_key
   * @returns Promise<PoolState | null>
   * Obtains up-to-date information about a particular melswap pool, identified by its [PoolKey]. Returns `None` if no such pool exists.
   */
  melswap_info(pool_key: PoolKey): Promise<PoolState | null>;

  /**
   * @param  {Denom} to
   * @param  {Denom} from
   * @param  {bigint} value
   * @returns Promise<SwapInfo | null>
   * Simulates a swap between the two given [Denom]s, returning a [SwapInfo] that contains detailed information about the swap (such as price, slippage, etc)
   */

  simulate_swap(
    to: Denom,
    from: Denom,
    value: bigint,
  ): Promise<SwapInfo | null>;

  /**
   * @param  {string} wallet_name
   * @param  {string} password
   * @param  {string} secret?
   * Creates a wallet. If `secret` is provided, this must be a Crockford-base32-encoded ed25519 private key.
   */
  create_wallet(
    wallet_name: string,
    password: string,
    secret?: string,
  ): Promise<void>;

  /**
   * @param wallet_name
   * @returns Promise<[CoinId, CoinData][]>
   * Dump all the coins of a given wallet.
   */
  dump_coins(wallet_name: string): Promise<[CoinID, CoinData][]>;
  /**
   * @param  {string} wallet_name
   * @returns Promise<[string, bigint | null][]>
   * Dumps the transactions history of the given wallet.
   */
  dump_transactions(wallet_name: string): Promise<[string, bigint | null][]>;

  /**
   * @param  {string} wallet_name
   * @returns Promise
   * Locks the wallet.
   */
  lock_wallet(wallet_name: string): Promise<void>;

  /**
   * @param  {string} wallet_name
   * @param  {string} password
   * @returns Promise
   * Unlocks the given wallet. If the password is incorrect, will return [WalletAccessError::Locked].
   */
  unlock_wallet(wallet_name: string, password: string): Promise<void>;

  /**
   * @param  {string} wallet_name
   * @param  {string} password
   * @returns Promise<string>
   * Exports the secret key, in the standard base32 format, from the given wallet. The password must be correct; if it is not, will return [WalletAccessError::Locked].
   */
  export_sk(wallet_name: string, password: string): Promise<string>;

  /**
   * @param  {string} wallet_name
   * @param  {PrepareTxArgs} request
   * @returns Promise<Transaction>
   * Prepares a transaction according to a template (see [PrepareTxArgs]). Returns a transaction that is ready for inspection.
   *
   * This method does not change the internal state of the wallet or send any transactions. Once you're sure you want to send the transaction returned, simply pass it to [MelwalletdProtocol::send_tx].
   */
  prepare_tx(wallet_name: string, request: PrepareTxArgs): Promise<Transaction>;

  /**
   * @param  {string} wallet_name
   * @param  {Transaction} tx
   * @returns {Promise<string>} this string represents the transaction hash
   * Sends a transaction to the network, returning its hash. Note that the absence of an error does *not* mean that the transaction will certainly go through!
   */
  send_tx(wallet_name: string, tx: Transaction): Promise<string>;

  /**
   * @param  {string} wallet_name
   * @param  {string} txhash
   * @returns Promise<TxBalance | null>
   * Returns the "balance" (see [TxBalance]) of a transaction --- how much it increased or decreased the balance of the wallet. If such a transaction doesn't exist in the given wallet, returns `Ok(None)`.
   */
  tx_balance(wallet_name: string, txhash: string): Promise<TxBalance | null>;

  /**
   * @param  {string} wallet_name
   * @param  {string} txhash
   * @returns Promise
   * Returns the status ([TxStatus]) of a transaction, which includes its full contents as well as where, if anywhere, was it confirmed. If no such transaction can be found, or if the wallet has given up on the transaction already, returns `null`.
   */
  tx_status(wallet_name: string, txhash: string): Promise<TxStatus | null>;

  /**
   * @param  {string} wallet_name
   * @returns Promise
   * A convenience method for sending a faucet transaction to the wallet itself.
   */
  send_faucet(wallet_name: string): Promise<string>;
}

export interface ThemelioWallet {
  /**
   * @returns Promise<string>
   * Returns the name of a wallet
   */
  get_name(): Promise<string>;

  /**
   * @returns Promise<string>
   * Get the wallet's public address
   */
  get_address(): Promise<string>;

  /**
   * @returns Promise<NetID>
   * Get the network this wallet belongs to, `NetID.Mainnet` for example
   */
  get_network(): Promise<NetID>;

  /**
   * @returns Promise<boolean>
   * Locks this wallet
   */
  lock(): Promise<boolean>;

  /**
   * @param  {string} password
   * @returns Promise
   * unlocks this wallet
   */
  unlock(password: string): Promise<boolean>;

  /**
   * @param  {string} password
   * @returns Promise<string | null>
   * exports the SECRET key of this wallet.
   * WARNING: anyone with the secret key can use your wallet and spend any coins within it. Use with caution
   */
  export_sk(password: string): Promise<string | null>;

  /**
   * @param  {Transaction} tx
   * @returns Promise<string>
   * Send a tx. Check prepare_transaction
   * @example
   *  let address = await this.get_address()
   *  let ptx_args: PrepareTxArgs = await PrepareTxArgsHelpers.swap(address, Denom.MEL, Denom.SYM, 100n)
   *  let tx: Transaction = await this.prepare_transaction(ptx_args)
   *  let tx_hash: string = await this.send_tx(tx)
   */
  send_tx(tx: Transaction): Promise<string>;

  /**
   * @param  {PrepareTxArgs} ptx
   * @returns Promise<Transaction>
   * Constructing a transaction involves specific formatting and precomputation that can be difficult to do by hand.
   * To bridge the difficulty gap, `prepare_transaction` exists to abstract away the computing.
   * Still, formatting a `PrepareTxArgs` by hand is complex and prone to mistakes, so there are helpe functions like `PrepareTxArgsHelpers.faucet`
   * that automatically generate the args for transactions based on only a few, necessary, inputs
   * @example
   * let ptx_args: PrepareTxArgs = await PrepareTxArgsHelpers.faucet(this, Denom.MEL, Denom.SYM, 100n)
   * let tx: Transaction = await this.prepare_transaction(ptx_args)
   */
  prepare_tx(ptx: PrepareTxArgs): Promise<Transaction>;
  /**
   * @param  {string} txhash
   * @returns Promise<TxStatus | null>
   * returns the status of a transaction or null if no transaction is found
   */
  tx_status(txhash: string): Promise<TxStatus | null>;
  /**
   * @returns Promise<Partial<Record<Denom, bigint>>>
   * Get the name and amount of all Denom's in a wallet
   * @example
   * // if this wallet has 100 MEL and 999 `CUSTOM-123`
   * await this.get_balance() === {MEL: 100n, 'CUSTOM-123': 999n}
   */
  get_balances(): Promise<Partial<Record<Denom, bigint>>>;
}
