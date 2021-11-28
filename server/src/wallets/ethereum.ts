import Web3 from 'web3';
import { Unit } from 'web3-utils/types';
import { TransferReport, Wallet } from './wallet';

export interface EthereumSettings {
	provider: string;
	address: string;
	privateKey: string;
}


function convert(value: string, from: Unit, to: Unit): string {
	return Web3.utils.fromWei(Web3.utils.toWei(value, from), to);
}

export default class EthereumWallet implements Wallet<Unit> {
	readonly net = 'goerly';
	readonly type = 'ethereum';
	units: Unit[] = ["ether", "kwei"];
	balance = Object.fromEntries(this.units.map(unit => [unit, "0"])) as Record<Unit, string>;
	private readonly web3: Web3;
	private readonly privateKey: string;
	readonly address: string;
	constructor(
		public readonly name: string,
		{ provider, privateKey, address }: EthereumSettings
	) {
		this.web3 = new Web3(provider);
		this.privateKey = privateKey;
		this.address = address;
		// TODO: maybe contructor should be call after checking balance?
		this.web3.eth
			.getBalance(address)
			.then(wei => {
				this.balance = Object.fromEntries(this.units.map(unit => [unit, Web3.utils.fromWei(wei, unit)])) as Record<Unit, string>;
			})
			.catch(console.error);
	}

	async move(addrTo: string, count: string, units: Unit): Promise<TransferReport> {
		const val = Web3.utils.toWei(count, units)
		const trans = await this.web3.eth.accounts.signTransaction({ to: addrTo, value: val, gas: 2000000 }, this.privateKey);
		if (trans.rawTransaction === undefined) {
			throw new Error("Unexpected undefined raw transaction")
		}
		const transaction = await this.web3.eth.sendSignedTransaction(trans.rawTransaction)
		return { message: `transaction status ${transaction.status} for transfer ${count} to ${addrTo}` }
	}
}
