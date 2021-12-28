import { Coin } from '@terra-money/terra.js';
import { Faucet } from './wallets/wallet';

function isNonNullable<T>(x: T): x is NonNullable<T> {
	if (x === undefined || x === null)
		return false;
	return true;
}

function getOrPutDefault<K extends string | number, V>(
	from: Record<K, V>,
	key: K,
	defaultValue: NonNullable<V>
): NonNullable<V> {
	const actualValue = from[key];
	if (isNonNullable(actualValue)) return actualValue;
	return from[key] = defaultValue;
}

export class LimitsManager {
	constructor(
		// eslint-disable-next-line no-unused-vars
		private readonly wallets: Faucet[],
		// eslint-disable-next-line no-unused-vars
		public readonly defaultLimits: Record<string, Coin> = {}
	) { }
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
		const wallet = this.wallets.find(w => w.name === walletId);
		if (wallet === undefined) {
			throw new Error("Wallet");
		}
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
