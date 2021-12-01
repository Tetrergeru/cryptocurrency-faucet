import { Coin, Coins } from '@terra-money/terra.js';
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

export default class EthereumWallet implements Wallet {
	readonly net = 'goerly';
	readonly type = 'ethereum';
	denoms: Unit[] = ['ether', 'kwei'];
	balance = new Coins(this.denoms.map(unit => new Coin(unit, 0)));
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
				this.balance = new Coins(
					this.denoms.map(unit => new Coin(unit, Web3.utils.fromWei(wei, unit)))
				);
			})
			.catch(console.error);
	}

	async move(addrTo: string, coin: Coin): Promise<TransferReport> {
		const val = Web3.utils.toWei(coin.amount.toString(), coin.denom as Unit);
		const trans = await this.web3.eth.accounts.signTransaction(
			{ to: addrTo, value: val, gas: 2000000 },
			this.privateKey
		);
		if (trans.rawTransaction === undefined) {
			throw new Error('Unexpected undefined raw transaction');
		}
		const transaction = await this.web3.eth.sendSignedTransaction(
			trans.rawTransaction
		);
		return {
			message: `transaction status ${transaction.status} for transfer ${coin} to ${addrTo}`,
		};
	}

	utils = {
		convert(coin: Coin, targetDemon: string) {
			if (targetDemon == coin.denom) return coin;
			return new Coin(
				targetDemon,
				convert(coin.amount.toString(), coin.denom as Unit, targetDemon as Unit)
			);
		},
	};
}
