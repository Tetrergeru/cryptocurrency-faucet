export interface Wallet {
	readonly id: string;
	// Wallet name
	readonly name: string;
	// Name of testnet
	readonly net: string;
	// Ethereum, Terra, etc
	readonly type: string;
	readonly balance: Record<string, string>;
	readonly denoms: string[];
}

export interface TransferRequest {
	readonly targetWallet: string;
	readonly moneyCount: string;
	readonly denom: string;
}

// Map[walletId][denom]limitValue
export type Limit = Record<string, Record<string, string>>;

export class ServerApi {
	static postRequest(id: string, req: TransferRequest): Promise<string> {
		return fetch(`/api/wallets/${id}/transfer`, {
			method: 'POST',
			body: JSON.stringify(req),
			headers: { 'Content-Type': 'application/json' },
		}).then(x => (x.ok ? x.text() : x.text().then(x => Promise.reject(x))));
	}

	static getWallets(): Promise<Wallet[]> {
		return fetch('/api/wallets/').then(x =>
			x.ok ? x.json() : x.text().then(x => Promise.reject(x))
		);
	}
	static getLimits(): Promise<Limit[]> {
		return fetch('/api/limits/').then(x =>
			x.ok ? x.json() : x.text().then(x => Promise.reject(x))
		);
	}
}
