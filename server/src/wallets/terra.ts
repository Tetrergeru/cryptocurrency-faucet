import {
	Coin,
	Coins,
	Dec,
	LCDClient,
	MnemonicKey,
	MsgSend,
	MsgSwap,
	Numeric,
	RawKey,
	Wallet,
} from '@terra-money/terra.js';
import { Faucet, TransferReport, WalletUtils } from './wallet';

export interface TerraFaucetSettings {
	gasType?: string;
	gasAmount?: Numeric.Input;
	mnemonicKey: string;
}

const uMultiplyer = 1000000;
export default class TerraFaucet implements Faucet {
	readonly net = 'bombay-12';
	readonly type = 'terra';
	balance: Coins = new Coins([new Coin('usd', 0)]);
	denoms: readonly string[] = ['usd'];

	private readonly terra: LCDClient;
	private readonly wallet: Wallet;
	constructor(readonly name: string, settings: TerraFaucetSettings) {
		const {
			gasType = 'luna',
			gasAmount = '0.0001',
			mnemonicKey
		} = settings;
		const gasPrices = new Coins([
			new Coin(`u${gasType}`, new Dec(uMultiplyer).mul(gasAmount)),
		]);
		this.terra = new LCDClient({
			// TODO: move to config?
			URL: 'https://bombay-lcd.terra.dev/',
			chainID: this.net,
			gasPrices,
		});
		if (mnemonicKey == undefined) {
			throw new Error(
				`can't initialize terra faucet: not found mnemonic key`
			);
		}
		this.wallet = this.terra.wallet(new MnemonicKey({ mnemonic: mnemonicKey }));

		this.terra.bank
			.balance(this.wallet.key.accAddress)
			.then(
				([coins]) =>
				(this.balance = new Coins(
					coins.map(
						c => new Coin(c.denom.substr(1), c.amount.div(uMultiplyer))
					)
				))
			)
			.catch(console.error);
	}

	async move(toWallet: string, coin: Coin): Promise<TransferReport> {
		const sendingCoins = new Coins([
			new Coin(`u${coin.denom}`, coin.amount.mul(uMultiplyer)),
		]);

		const my_tx = new MsgSend(
			this.wallet.key.accAddress,
			toWallet,
			sendingCoins
		);

		try {
			const tx = await this.wallet.createAndSignTx({ msgs: [my_tx] });
			const transaction = await this.terra.tx.broadcast(tx);
			console.debug(transaction);
			return {
				message: `Succesfully transfered: ${transaction.info}`,
				transactionURL: `https://finder.terra.money/${this.net}/tx/${transaction.txhash}`,
			};
		} catch (err: any) {
			if (err.response) {
				console.error(err.response.data);
				throw new Error(err.response.data);
			}
			console.error(err.message);
			throw err;
		}
	}

	utils: WalletUtils = {
		convert(coin: Coin, targetDemon: string) {
			throw new Error(
				`can't convert ${coin} to ${targetDemon}: not implemented`
			);
		},
	};
}

// maybe usefull in future
async function swapTokens(
	terraClient: LCDClient,
	wallet: Wallet,
	fromTokens: string,
	toTokens: string,
	amount: number
) {
	const swapCoin = new Coin('u' + fromTokens, new Dec(1000000).mul(amount));
	const swap = new MsgSwap(wallet.key.accAddress, swapCoin, 'u' + toTokens);
	await wallet
		.createAndSignTx({ msgs: [swap] })
		.then(tx => terraClient.tx.broadcast(tx))
		.then(console.info)
		.catch(err => {
			if (err.response) {
				console.error(err.response.data);
			} else {
				console.error(err.message);
			}
		});
}
