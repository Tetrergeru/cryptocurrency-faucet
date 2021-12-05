import express, { Router } from 'express';
import { LimitsManager } from './limitsmanager';
import EthereumWallet from './wallets/ethereum';
import { SimpleWallet, BadWallet, SlowlyWallet } from './wallets/local';
import { Faucet } from './wallets/wallet';
import { Coin, Numeric } from '@terra-money/terra.js';
import TerraFaucet, { TerraFaucetSettings } from './wallets/terra';
const app = express();
app.use(express.json());

const defaultConfig = {
	api: {
		host: 'localhost',
		port: 2000,
	},
	wallets: {
		goerli: {
			provider: '',
			address: '',
			privateKey: '',
			limit: 0.001,
		},
		bombay: {
			limit: 1,
			mnemonicKey: '',
			privateKey: '',
		} as TerraFaucetSettings & { limit: Numeric.Input },
	},
	defaultLimits: 50,
};

function parseIntOrDefault(str: string, defaultValue: number): number {
	const fromEnvInt = parseInt(str);
	return Number.isNaN(fromEnvInt) ? defaultValue : fromEnvInt;
}

function readEnvConfig<T extends object>(prefix: string, defaultConfig: T): T {
	return Object.fromEntries(
		Object.entries(defaultConfig).map(([key, defaultValue]) => {
			const envKey = `${prefix}_${key.toUpperCase()}`;
			switch (typeof defaultValue) {
				// TODO arrays
				case 'object':
					return [key, readEnvConfig(envKey, defaultValue)];
				case 'string':
					return [key, process.env[envKey] || defaultValue];
				case 'number':
					return [
						key,
						parseIntOrDefault(process.env[envKey] || '', defaultValue),
					];
				case 'boolean':
					return [
						key,
						process.env[envKey] === undefined
							? defaultValue
							: process.env[envKey] === 'true',
					];
			}
			throw new Error(
				`not supported type ${typeof defaultValue} for ${envKey}`
			);
		})
	) as T;
}

const config = readEnvConfig('APP', defaultConfig);
console.log(config);

const Wallets: Faucet[] = [
	new SimpleWallet('SimpleFaucet', 500),
	new BadWallet('BadFaucet', 5000),
	new SimpleWallet('EmptyFaucet', 0),
	new SlowlyWallet(new SimpleWallet('Sloy faucet', 500), 1500),
	new SlowlyWallet(new BadWallet('Sloy bad faucet', 500), 1500),
];

try {
	Wallets.unshift(new TerraFaucet('Bombay-12', config.wallets.bombay));
} catch (err: any) {
	console.error(`Failed to create bombay wallet: ${err?.message || err}`);
}

try {
	Wallets.unshift(new EthereumWallet('Goerli', config.wallets.goerli));
} catch (err: any) {
	console.error(`Failed to create goerli wallet: ${err?.message || err}`);
}

function walletHasId(id: string, wallet: Faucet): boolean {
	return wallet.name === id;
}

const walletWithId = (id: string) => walletHasId.bind(undefined, id);

const Limits = new LimitsManager(Wallets, {
	...Object.fromEntries(
		Wallets.filter(w => w.type === 'mock').map(w => [
			w.name,
			new Coin(w.denoms[0], config.defaultLimits),
		])
	),
	Goerli: new Coin('ether', config.wallets.goerli.limit),
	'Bombay-12': new Coin('luna', config.wallets.bombay.limit),
});

const CurrentUser = 'anon-user';

const walltesRouter = Router();
const limitsRouter = Router();

walltesRouter.get('/', (req, res) => {
	res.json(Wallets.map(WalletToJSONModel));
});

walltesRouter.get('/:walletId', (req, res) => {
	const wallet = Wallets.find(walletWithId(req.params.walletId));
	if (wallet !== undefined) {
		return res.json(WalletToJSONModel(wallet));
	}
	res.sendStatus(404);
});

interface TransferRequest {
	targetWallet: string;
	moneyCount: string;
	denom: string;
}
walltesRouter.post('/:walletId/transfer', (req, res) => {
	const r = <TransferRequest>req.body;
	console.log(r);
	const fromId = req.params.walletId;
	const sourceWallet = Wallets.find(walletWithId(fromId));
	if (sourceWallet === undefined) {
		return res.sendStatus(404);
	}
	if (!sourceWallet.denoms.includes(r.denom)) {
		return res.status(400).json({
			status: `Unsupported units for wallet. Expected: ${sourceWallet.denoms.join(
				', '
			)}`,
		});
	}
	const coin = new Coin(r.denom, r.moneyCount);
	try {
		const limits = Limits.take(CurrentUser, fromId, coin);
		sourceWallet
			.move(r.targetWallet, coin)
			.then(res.json.bind(res))
			.catch(err => {
				console.error(err?.message || err);
				res.status(412).json({ status: err.message });
				Limits.take(
					CurrentUser,
					fromId,
					new Coin(limits.denom, -limits.amount)
				);
			});
	} catch (e) {
		res.status(412).json({ status: (e as Error)?.message });
	}
});

limitsRouter.get('/', (req, res) => {
	return res.json([
		Object.fromEntries(
			Object.entries(Limits.limitsForUser(CurrentUser)).map(([key, coin]) => {
				const wallet = Wallets.find(walletWithId(key))!;
				return [
					key,
					Object.fromEntries(
						wallet.denoms.map(denom => [
							denom,
							denom === coin?.denom
								? coin.amount
								: wallet.utils.convert(coin!, denom).amount,
						])
					),
				];
			})
		),
	]); // TODO
});

app.use('/api/wallets', walltesRouter);
app.use('/api/limits', limitsRouter);

app.listen(config.api.port, () => {
	console.log(`server is listening on ${config.api.port}`);
});
function WalletToJSONModel({ name, balance, net, type, denoms }: Faucet) {
	return {
		name,
		balance: Object.fromEntries(balance.map(c => [c.denom, c.amount])),
		net,
		type,
		id: name,
		denoms,
	};
}
