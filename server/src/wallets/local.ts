import { TransferReport, Wallet } from './wallet';

function timer(time: number): Promise<undefined> {
	return new Promise(resolve => setTimeout(resolve, time));
}

abstract class InMemoryWallet implements Wallet {
	readonly net = 'InMemory';
	readonly type = 'mock';
	constructor(public readonly name: string, public balance = 100) {}
	abstract move(to: string, count: number): Promise<TransferReport>;
}

export class SimpleWallet extends InMemoryWallet {
	move(to: string, count: number): Promise<TransferReport> {
		if (count <= this.balance) {
			this.balance -= count;
			return Promise.resolve({ message: `transfered ${count} to ${to}` });
		}
		return Promise.reject(new Error('Not enough tokens on wallet'));
	}
}

export class SlowlyWallet implements Wallet {
	constructor(private readonly origin: Wallet, readonly delay: number) {}
	get name(): string {
		return this.origin.name;
	}
	get net(): string {
		return this.origin.net;
	}
	get type(): string {
		return this.origin.type;
	}
	get balance(): number {
		return this.origin.balance;
	}
	move(to: string, count: number): Promise<TransferReport> {
		return timer(this.delay).then(
			this.origin.move.bind(this.origin, to, count)
		);
	}
}

export class BadWallet extends InMemoryWallet {
	move(to: string, count: number): Promise<TransferReport> {
		return Promise.reject(new Error('Network problems... Try again later'));
	}
}
