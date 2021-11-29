import { Coin } from '@terra-money/terra.js';
import { Wallet } from './wallets/wallet';

function getOrPutDefault<K extends string | number, V>(
	from: Record<K, V>,
	key: K,
	defaultValue: NonNullable<V>
): NonNullable<V> {
	if (from[key] === undefined) 
		return from[key] = defaultValue;
	return from[key]!;
}

export class LimitsManager {
	constructor(
		private readonly wallets: Wallet[],
		public readonly defaultLimits: Record<string, Coin> = {}
	) {}
	private readonly limits = {} as Record<
		string,
		Record<string, Coin | undefined> | undefined
	>;
	take(user: string, wallet: string, count: string): number {
		const userLimits = getOrPutDefault(this.limits, user, {});
		const walletLimit = getOrPutDefault(userLimits, wallet, this.defaultLimits[wallet]);

		// const decrease = Math.min(walletLimit, count);
		// userLimits[wallet] = walletLimit - decrease;
		// return decrease;
		return 0
	}
	limitsForUser(user: string) {
		const userLimits = getOrPutDefault(this.limits, user, {});
		this.wallets.forEach(({ name }) =>
			getOrPutDefault(userLimits, name, this.defaultLimits[name])
		);
		return userLimits;
	}
}
