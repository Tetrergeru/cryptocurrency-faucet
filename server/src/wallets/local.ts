import { Coin, Coins, Dec } from '@terra-money/terra.js';
import { TransferReport, Wallet } from './wallet';

function timer(time: number): Promise<undefined> {
	return new Promise(resolve => setTimeout(resolve, time));
}

abstract class InMemoryWallet implements Wallet {
	readonly net = 'InMemory';
	readonly type = 'mock';
	protected chips: Dec;
	get balance() {
		return new Coins([new Coin("chips", this.chips)])
	}
	constructor(public readonly name: string, balance = 100) {
		this.chips = new Dec(balance);
	}
	readonly denoms = ['chips'] as const;
	abstract move(to: string, coin: Coin): Promise<TransferReport>;
}

export class SimpleWallet extends InMemoryWallet {
	move(to: string, coin: Coin): Promise<TransferReport> {
		if (coin.amount.lessThanOrEqualTo(this.chips)) {
			this.chips = this.chips.sub(coin.amount);
			return Promise.resolve({ message: `transfered ${coin} to ${to}` });
		}
		return Promise.reject(new Error('Not enough tokens on wallet'));
	}
}

export class SlowlyWallet implements Wallet {
	constructor(private readonly origin: Wallet, readonly delay: number) { }
	get denoms() {
		return this.origin.denoms;
	}
	get name(): string {
		return this.origin.name;
	}
	get net(): string {
		return this.origin.net;
	}
	get type(): string {
		return this.origin.type;
	}
	get balance(): Coins {
		return this.origin.balance;
	}
	move(to: string, coin: Coin): Promise<TransferReport> {
		return timer(this.delay).then(
			this.origin.move.bind(this.origin, to, coin)
		);
	}
}

export class BadWallet extends InMemoryWallet {
	move(): Promise<TransferReport> {
		return Promise.reject(new Error('Network problems... Try again later'));
	}
}
