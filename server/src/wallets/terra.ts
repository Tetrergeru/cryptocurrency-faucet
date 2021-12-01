import { LCDClient, MnemonicKey, MsgSend } from '@terra-money/terra.js';

async function terra_faucet(
	to_wallet: string,
	token_type: string,
	amount: number
) {
	const terra = new LCDClient({
		URL: 'https://bombay-lcd.terra.dev/',
		chainID: 'bombay-12',
	});

	// Granter (terra1maqmnzxcxg4vee7qggjgpwwj2ej45xg30zrsvd)
	const faucet_wallet = terra.wallet(
		new MnemonicKey({
			mnemonic:
				'practice enhance suffer vital enforce deposit install car deer trade tent bid brave size ride play valid throw image copy panther brick rhythm west',
		})
	);

	const my_tx = new MsgSend(
		faucet_wallet.key.accAddress,
		to_wallet,
		// (1000000 * amount).toString() + 'u' + token_type
		{ uusd: 1000000 * amount }
	);

	await faucet_wallet
		.createAndSignTx({
			msgs: [my_tx],
			memo: 'test sending',
		})
		.then(tx => terra.tx.broadcast(tx))
		.then(console.info)
		.catch(err => {
			if (err.response) {
				console.error(err.response.data);
			} else {
				console.error(err.message);
			}
		});
}

// terra_faucet("terra1axmdadm204mcyh4vqstgjl59us9tc3cah78s3j",'usd', 100).catch(console.error);
const terra = new LCDClient({
	URL: 'https://bombay-lcd.terra.dev/',
	chainID: 'bombay-12',
});
const faucet_wallet = terra.wallet(
	new MnemonicKey({
		mnemonic:
			'practice enhance suffer vital enforce deposit install car deer trade tent bid brave size ride play valid throw image copy panther brick rhythm west',
	})
);

console.log(faucet_wallet.key.accAddress);
terra.bank
	.balance(faucet_wallet.key.accAddress)
	.then(([coints]) => console.log(coints.map(c => c)));
terra.bank.total().then(([coins]) => console.error(coins.map(c => c)));
terra.oracle.exchangeRates().then(firstCourse => {
	let prevCourse = firstCourse;
	let count = 1;
	console.debug(firstCourse);
	setInterval(() => {
		terra.oracle.exchangeRates().then(newCourse => {
			console.log(
				newCourse.map(newCoin => [
					newCoin.denom,
					newCoin.amount,
					newCoin.sub(prevCourse.get(newCoin.denom)!.amount).amount,
					newCoin.sub(firstCourse.get(newCoin.denom)!.amount).amount,
					newCoin.sub(firstCourse.get(newCoin.denom)!.amount).amount.div(count),
				])
			);
			prevCourse = newCourse;
			count++;
		});
	}, 30000);
});
terra.oracle.activeDenoms().then(console.debug);
