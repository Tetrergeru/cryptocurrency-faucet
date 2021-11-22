import Web3 from 'web3';
import { TransferReport, Wallet } from './wallet';

export interface EthereumSettings {
	provider: string;
	address: string;
	privateKey: string;
}

export default class EthereumWallet implements Wallet {
	readonly net = 'goerly';
	readonly type = 'ethereum';
	balance = 0;
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
			.then(w => (this.balance = +this.web3.utils.fromWei(w)))
			.catch(console.error);
	}

	async move(addrTo: string, count: number): Promise<TransferReport> {
		const val = this.web3.utils.toWei(count.toString(), 'ether') // кол-во эфира
		const trans = await this.web3.eth.accounts.signTransaction({ to: addrTo, value: val, gas: 2000000 }, this.privateKey); //создаем и подписываем транзакцию
		if (trans.rawTransaction === undefined) {
			throw new Error("Unexpected undefined raw transaction")
		}
		const transaction = await this.web3.eth.sendSignedTransaction(trans.rawTransaction) // кидаем транзакцию
		return {message: `transaction status ${transaction.status} for transfer ${count} to ${addrTo}`}
	}
}
