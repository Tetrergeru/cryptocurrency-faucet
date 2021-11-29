import { Coin, Coins, Denom } from "@terra-money/terra.js";

export interface Wallet {
	// Wallet name
	readonly name: string;
	// Name of testnet
	readonly net: string;
	// Ethereum, Terra, etc
	readonly type: string;
	readonly balance: Coins;
	readonly denoms: ReadonlyArray<Denom>;
	move(to: string, coin: Coin): Promise<TransferReport>;
}

export interface WalletUtils {
	convert(coin: Coin, targetDenom: Denom): Coin;
}

// TODO: think about info and fields
export interface TransferReport {
	readonly message: string;
}
