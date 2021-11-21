export interface Wallet {
	// Wallet name
	readonly name: string;
	// Name of testnet
	readonly net: string;
	// Ethereum, Terra, etc
	readonly type: string;
	readonly balance: number;

	move(to: string, count: number): Promise<TransferReport>;
}

// TODO: think about info and fields
export interface TransferReport {
	readonly message: string;
}
