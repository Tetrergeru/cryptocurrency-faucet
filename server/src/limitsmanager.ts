import { Coin } from '@terra-money/terra.js';
import { Wallet } from './wallets/wallet';

function getOrPutDefault<K extends string | number, V>(
	from: Record<K, V>,
	key: K,
	defaultValue: NonNullable<V>
): NonNullable<V> {
	if (from[key] === undefined) return (from[key] = defaultValue);
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
	take(user: string, walletId: string, wanted: Coin): Coin {
		const userLimits = getOrPutDefault(this.limits, user, {});
		const walletLimit = getOrPutDefault(
			userLimits,
			walletId,
			this.defaultLimits[walletId]
		);
		const wallet = this.wallets.find(w => w.name === walletId)!;
		const decrease = wallet.utils.convert(wanted, walletLimit.denom);
		if (decrease.amount.greaterThan(walletLimit.amount))
			throw new Error(`Limit overflow`);
		userLimits[walletId] = walletLimit.sub(decrease);
		return decrease;
	}
	limitsForUser(user: string) {
		const userLimits = getOrPutDefault(this.limits, user, {});
		this.wallets.forEach(({ name }) =>
			getOrPutDefault(userLimits, name, this.defaultLimits[name])
		);
		return userLimits;
	}
}
