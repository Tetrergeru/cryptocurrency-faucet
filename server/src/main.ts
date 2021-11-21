import express, { Router } from 'express';

const app = express();
app.use(express.json());

const defaultConfig = {
	api: {
		host: "localhost",
		port: 3000
	},
}

function readEnvConfig<T extends object>(prefix: string, defaultConfig: T): T {
	return Object.fromEntries(Object.entries(defaultConfig).map(([key, defaultValue]) => {
		const envKey = `${prefix}_${key.toUpperCase()}`;
		switch (typeof defaultValue) {
			// TODO arrays
			case "object":
				return [key, readEnvConfig(envKey, defaultValue)]
			case 'string':
				return [key, process.env[envKey] || defaultValue]
			case 'number':
				const fromEnvInt = parseInt(process.env[envKey] || "");
				return [key, Number.isNaN(fromEnvInt) ? defaultValue : fromEnvInt]
			case 'boolean':
				const envBool = process.env[envKey];
				return [key, envBool === undefined ? defaultValue : envBool === 'true']
		}
		throw new Error(`not supported type ${typeof defaultValue} for ${envKey}`)
	})) as T;
}

const config = readEnvConfig("APP", defaultConfig);


function timer(time: number): Promise<undefined> {
	return new Promise((resolve) => setTimeout(resolve, time));
}

class CryptoWallet {

}

interface Wallet {
	// Wallet name
	readonly name: string
	// Name of testnet
	readonly net: string
	// Ethereum, Terra, etc
	readonly type: string
	readonly balance: number

	move(to: string, count: number): Promise<TransferReport>
}

abstract class InMemoryWallet implements Wallet {
	readonly net = "InMemory"
	readonly type = "mock"
	constructor(public readonly name: string, public balance = 100) {
	}
	abstract move(to: string, count: number): Promise<TransferReport>;
}

interface TransferReport {
	readonly status: "success" | "failed"
}

class SimpleWallet extends InMemoryWallet {
	move(to: string, count: number): Promise<TransferReport> {
		if (count <= this.balance) {
			this.balance -= count;
			return Promise.resolve({ status: "success" })
		}
		return Promise.reject(new Error("Not enough tokens on wallet"))
	}
}

class SlowlyWallet implements Wallet {
	constructor(private readonly origin: Wallet, readonly delay: number) { }
	get name(): string { return this.origin.name };
	get net(): string { return this.origin.net };
	get type(): string { return this.origin.type };
	get balance(): number { return this.origin.balance };
	move(to: string, count: number): Promise<TransferReport> {
		return timer(this.delay).then(this.origin.move.bind(this.origin, to, count));
	}
}

class BadWallet extends InMemoryWallet {
	move(to: string, count: number): Promise<TransferReport> {
		return Promise.reject(new Error("Network problems... Try again later"))
	}
}


const Wallets: Wallet[] = [
	new SimpleWallet("SimpleWallet", 500),
	new BadWallet("BadWallet", 5000),
	new SimpleWallet("Empty", 0),
	new SlowlyWallet(new SimpleWallet("Sloy wallet", 500), 1500),
	new SlowlyWallet(new BadWallet("Sloy bad wallet", 500), 1500),
];

app.get('/', (req, res) => {
	res.send('Hello crypto-loot!');
});


function walletHasId(id: string, wallet: Wallet): boolean {
	return wallet.name === id;
}

const walletWithId = (id: string) => walletHasId.bind(undefined, id)


interface TransferRequest {
	targetWallet: string;
	moneyCount: number;
}

function getOrPutDefault<K extends string | number, V>(from: Record<K, V>, key: K, defaultValue: NonNullable<V>): NonNullable<V> {
	if (from[key] === undefined)
		from[key] = defaultValue
	return from[key]!
}

class LimitsManager {
	constructor(public readonly defaultLimit = 50) { }
	private readonly limits = {} as Record<string, Record<string, number | undefined> | undefined>
	take(user: string, wallet: string, count: number): number {
		const userLimits = getOrPutDefault(this.limits, user, {});
		const walletLimit = getOrPutDefault(userLimits, wallet, this.defaultLimit)
		const decrease = Math.min(walletLimit, count)
		userLimits[wallet] = walletLimit - decrease;
		return decrease;
	}
	limitsForUser(user: string) {
		const userLimits = getOrPutDefault(this.limits, user, {});
		Wallets.forEach(({name})=>getOrPutDefault(userLimits, name, this.defaultLimit))
		return userLimits
	}
}

const Limits = new LimitsManager();
const CurrentUser = "anon-user";

const walltesRouter = Router();
const limitsRouter = Router();

walltesRouter.get('/', (req, res) => {
	res.json(Wallets.map(WalletToJSONModel))
});

walltesRouter.get('/:walletId', (req, res) => {
	const wallet = Wallets.find(walletWithId(req.params.walletId))
	if (wallet !== undefined) {
		return res.json(WalletToJSONModel(wallet));
	}
	res.sendStatus(404);
});


walltesRouter.post('/:walletId/transfer', (req, res) => {
	const r = <TransferRequest>req.body;
	console.log(r)
	const fromId = req.params.walletId;
	const sourceWallet = Wallets.find(walletWithId(fromId));
	if (sourceWallet === undefined) {
		return res.sendStatus(404);
	}
	const limits = Limits.take(CurrentUser, fromId, r.moneyCount);
	sourceWallet.move(r.targetWallet, limits)
		.then(res.json.bind(res))
		.catch(err => {
			console.error(err?.message||err)
			res.status(412).json({ status: err.message });
			Limits.take(CurrentUser, fromId, -limits)
		});
});

limitsRouter.get('/', (req, res) => {
	return res.json([Limits.limitsForUser(CurrentUser)])
});

app.use('/api/wallets', walltesRouter);
app.use('/api/limits', limitsRouter);

app.listen(config.api.port, () => {
	console.log(`server is listening on ${config.api.port}`);
});
function WalletToJSONModel({ name, balance, net, type }: Wallet) {
	return { name, balance, net, type, id: name };
}

