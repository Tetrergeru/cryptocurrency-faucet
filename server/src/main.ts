import express, { Router } from 'express';
import { LimitsManager } from './limitsmanager';
import './wallets/ethereum';
import EthereumWallet from './wallets/ethereum';
import { SimpleWallet, BadWallet, SlowlyWallet } from './wallets/local';
import { Wallet } from './wallets/wallet';
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

const Wallets: Wallet[] = [
	new SimpleWallet('SimpleWallet', 500),
	new BadWallet('BadWallet', 5000),
	new SimpleWallet('Empty', 0),
	new SlowlyWallet(new SimpleWallet('Sloy wallet', 500), 1500),
	new SlowlyWallet(new BadWallet('Sloy bad wallet', 500), 1500),
];

try {
	Wallets.push(new EthereumWallet('Goerli', config.wallets.goerli));
} catch (err: any) {
	console.error(`Failed to create goerli wallet: ${err?.message || err}`);
}

function walletHasId(id: string, wallet: Wallet): boolean {
	return wallet.name === id;
}

const walletWithId = (id: string) => walletHasId.bind(undefined, id);

const Limits = new LimitsManager(config.defaultLimits, Wallets, {'Goerli': config.wallets.goerli.limit});
const CurrentUser = 'anon-user';

const walltesRouter = Router();
const limitsRouter = Router();

walltesRouter.get('/', (req, res) => {
	res.json(Wallets.map(WalletToJSONModel));
	console.log(')))')
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
	moneyCount: number;
}
walltesRouter.post('/:walletId/transfer', (req, res) => {
	const r = <TransferRequest>req.body;
	console.log(r);
	const fromId = req.params.walletId;
	const sourceWallet = Wallets.find(walletWithId(fromId));
	if (sourceWallet === undefined) {
		return res.sendStatus(404);
	}
	const limits = Limits.take(CurrentUser, fromId, r.moneyCount);
	sourceWallet
		.move(r.targetWallet, limits)
		.then(res.json.bind(res))
		.catch(err => {
			console.error(err?.message || err);
			res.status(412).json({ status: err.message });
			Limits.take(CurrentUser, fromId, -limits);
		});
});

limitsRouter.get('/', (req, res) => {
	return res.json([Limits.limitsForUser(CurrentUser)]);
});

app.use('/api/wallets', walltesRouter);
app.use('/api/limits', limitsRouter);

app.listen(config.api.port, () => {
	console.log(`server is listening on ${config.api.port}`);
});
function WalletToJSONModel({ name, balance, net, type }: Wallet) {
	return { name, balance, net, type, id: name };
}