import type {Denom} from './types/denom';
import {
  WalletSummary,
  SwapInfo,
  TxBalance,
  TransactionStatus,
  UnpreparedTransaction,
  ThemelioWallet,
} from './types/melwalletd-types';
import {
  Header,
  PoolKey,
  PoolState,
  CoinID,
  CoinData,
  Transaction,
} from './types/themelio-types';

export interface WalletGetter<T extends ThemelioWallet> {
  get_wallet(name: string): Promise<T>;
}
export interface MelwalletdProtocol {
  /// Returns a list of wallet names.
  list_wallets(): Promise<string[]>;

  /// Returns a summary of the overall state of the wallet. See [WalletSummary] for what that entails.
  wallet_summary(wallet_name: string): Promise<WalletSummary>;

  /// Returns the latest blockchain header.
  latest_header(): Promise<Header>;

  /// Obtains up-to-date information about a particular melswap pool, identified by its [PoolKey]. Returns `None` if no such pool exists.
  melswap_info(pool_key: PoolKey): Promise<PoolState | null>;

  /// Simulates a swap between the two given [Denom]s, returning a [SwapInfo] that contains detailed information about the swap (such as price, slippage, etc)
  simulate_swap(
    to: Denom,
    from: Denom,
    value: bigint,
  ): Promise<SwapInfo | null>;

  /// Creates a wallet. If `secret` is provided, this must be a base32-encoded ed25519 private key.
  create_wallet(
    wallet_name: string,
    password: string,
    secret?: string,
  ): Promise<void>;

  /// Dump all the coins of a given wallet.
  dump_coins(wallet_name: string): Promise<[CoinID, CoinData][]>;

  /// Dumps the transactions history of the given wallet.
  dump_transactions(wallet_name: string): Promise<[string, bigint | null][]>;

  /// Locks the wallet.
  lock_wallet(wallet_name: string): Promise<void>;

  /// Unlocks the given wallet. If the password is incorrect, will return [WalletAccessError::Locked].
  unlock_wallet(wallet_name: string, password: string): Promise<void>;

  /// Exports the secret key, in the standard base32 format, from the given wallet. The password must be correct; if it is not, will return [WalletAccessError::Locked].
  export_sk(wallet_name: string, password: string): Promise<string>;

  /// Prepares a transaction according to a template (see [PrepareTxArgs]). Returns a transaction that is ready for inspection.
  ///
  /// This method does not change the internal state of the wallet or send any transactions. Once you're sure you want to send the transaction returned, simply pass it to [MelwalletdProtocol::send_tx].
  prepare_tx(
    wallet_name: string,
    request: UnpreparedTransaction,
  ): Promise<Transaction>;

  /// Sends a transaction to the network, returning its hash. Note that the absence of an error does *not* mean that the transaction will certainly go through!
  send_tx(wallet_name: string, tx: Transaction): Promise<string>;

  /// Returns the "balance" (see [TxBalance]) of a transaction --- how much it increased or decreased the balance of the wallet. If such a transaction doesn't exist in the given wallet, returns `Ok(None)`.
  tx_balance(wallet_name: string, txhash: string): Promise<TxBalance | null>;

  /// Returns the status ([TransactionStatus]) of a transaction, which includes its full contents as well as where, if anywhere, was it confirmed. If no such transaction can be found, or if the wallet has given up on the transaction already, returns `Ok(None)`.
  tx_status(
    wallet_name: string,
    txhash: string,
  ): Promise<TransactionStatus | null>;

  /// A convenience method for sending 1000 MEL of a faucet transaction to the wallet itself.
  send_faucet(wallet_name: string): Promise<string>;
}
