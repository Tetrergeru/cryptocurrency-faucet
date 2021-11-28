export interface Wallet<Unit extends string> {
	// Wallet name
	readonly name: string;
	// Name of testnet
	readonly net: string;
	// Ethereum, Terra, etc
	readonly type: string;
	readonly balance: Record<Unit, string>;
	readonly units: ReadonlyArray<Unit>;
	move(to: string, count: string, unit: Unit): Promise<TransferReport>;
}

// TODO: think about info and fields
export interface TransferReport {
	readonly message: string;
}
