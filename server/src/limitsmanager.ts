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
		public readonly defaultLimit = 50,
		private readonly wallets: Wallet[]
	) {}
	private readonly limits = {} as Record<
		string,
		Record<string, number | undefined> | undefined
	>;
	take(user: string, wallet: string, count: number): number {
		const userLimits = getOrPutDefault(this.limits, user, {});
		const walletLimit = getOrPutDefault(userLimits, wallet, this.defaultLimit);
		const decrease = Math.min(walletLimit, count);
		userLimits[wallet] = walletLimit - decrease;
		return decrease;
	}
	limitsForUser(user: string) {
		const userLimits = getOrPutDefault(this.limits, user, {});
		this.wallets.forEach(({ name }) =>
			getOrPutDefault(userLimits, name, this.defaultLimit)
		);
		return userLimits;
	}
}
