import { TransferReport, Wallet } from './wallet';

function timer(time: number): Promise<undefined> {
	return new Promise(resolve => setTimeout(resolve, time));
}

abstract class InMemoryWallet implements Wallet<"chips"> {
	readonly net = 'InMemory';
	readonly type = 'mock';
	protected chips: number;
	get balance() {
		return { chips: this.chips.toString() }
	}
	constructor(public readonly name: string, balance = 100) {
		this.chips = balance;
	}
	readonly units = ['chips'] as const;
	abstract move(to: string, count: string): Promise<TransferReport>;
}

export class SimpleWallet extends InMemoryWallet {
	move(to: string, count: string): Promise<TransferReport> {
		const value = Number(count)
		if(Number.isNaN(count))
			throw new Error(`${count} is not a number`);
		if (value <= this.chips) {
			this.chips -= value;
			return Promise.resolve({ message: `transfered ${count} to ${to}` });
		}
		return Promise.reject(new Error('Not enough tokens on wallet'));
	}
}

export class SlowlyWallet<U extends string> implements Wallet<U> {
	constructor(private readonly origin: Wallet<U>, readonly delay: number) { }
	get units() {
		return this.origin.units;
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
	get balance(): Record<U, string> {
		return this.origin.balance;
	}
	move(to: string, count: string, unit: U): Promise<TransferReport> {
		return timer(this.delay).then(
			this.origin.move.bind(this.origin, to, count, unit)
		);
	}
}

export class BadWallet extends InMemoryWallet {
	move(): Promise<TransferReport> {
		return Promise.reject(new Error('Network problems... Try again later'));
	}
}
