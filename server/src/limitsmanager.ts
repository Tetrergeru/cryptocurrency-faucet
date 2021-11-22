import { Wallet } from './wallets/wallet';

function getOrPutDefault<K extends string | number, V>(
	from: Record<K, V>,
	key: K,
	defaultValue: NonNullable<V>
): NonNullable<V> {
	if (from[key] === undefined) from[key] = defaultValue;
	return from[key]!;
}

export class LimitsManager {
	constructor(
		public readonly defaultLimit: number,
		private readonly wallets: Wallet[],
		public readonly defaultLimits: Record<string, number|undefined> = {}
	) {}
	private readonly limits = {} as Record<
		string,
		Record<string, number | undefined> | undefined
	>;
	take(user: string, wallet: string, count: number): number {
		const userLimits = getOrPutDefault(this.limits, user, {});
		const walletLimit = getOrPutDefault(userLimits, wallet, this.defaultLimits[wallet]||this.defaultLimit);
		const decrease = Math.min(walletLimit, count);
		userLimits[wallet] = walletLimit - decrease;
		return decrease;
	}
	limitsForUser(user: string) {
		const userLimits = getOrPutDefault(this.limits, user, {});
		this.wallets.forEach(({ name }) =>
			getOrPutDefault(userLimits, name, this.defaultLimits[name]||this.defaultLimit)
		);
		return userLimits;
	}
}
