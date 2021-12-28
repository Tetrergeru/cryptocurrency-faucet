import express, { Router } from 'express';
import { LimitsManager } from './limitsmanager';
import EthereumWallet from './wallets/ethereum';
import { SimpleWallet, BadWallet, SlowlyWallet } from './wallets/local';
import { Faucet } from './wallets/wallet';
import { Coin } from '@terra-money/terra.js';
import TerraFaucet from './wallets/terra';
import passport from 'passport';
import session from 'express-session';
import mongoose from 'mongoose';
import MongoStore from 'connect-mongo';
import { User } from './users';
import config from './config';
import authRouter, { authCheckMiddleware } from './auth';

console.log("Connecting to mongodb...");

mongoose
	.connect(`mongodb://${config.database.host}`, {
		auth: {
			username: config.database.user,
			password: config.database.password,
		},
	})
	.then(() => {
		console.log('CONNECTED BY MONGOOSE')
		const Wallets: Faucet[] = config.wallets.debug
			? [
				new SimpleWallet('SimpleFaucet', 500),
				new BadWallet('BadFaucet', 5000),
				new SimpleWallet('EmptyFaucet', 0),
				new SlowlyWallet(new SimpleWallet('Sloy faucet', 500), 1500),
				new SlowlyWallet(new BadWallet('Sloy bad faucet', 500), 1500),
			]
			: [];

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
					new Coin(w.denoms[0], config.wallets.debugLimits),
				])
			),
			Goerli: new Coin('ether', config.wallets.goerli.limit),
			'Bombay-12': new Coin('usd', config.wallets.bombay.limit),
		});

		const usersRouter = Router();
		usersRouter.get('/me', (req, res) => {
			res.json(req.user);
		});

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
			const user = req.user as User;
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
				const limits = Limits.take(user.id, fromId, coin);
				sourceWallet
					.move(r.targetWallet, coin)
					.then(res.json.bind(res))
					.catch(err => {
						console.error(err?.message || err);
						res.status(412).json({ status: err.message });
						Limits.take(user.id, fromId, new Coin(limits.denom, `-${limits.amount.toString()}`));
					});
			} catch (e) {
				res.status(412).json({ status: (e as Error)?.message });
			}
		});

		limitsRouter.get('/', (req, res) => {
			const user = req.user as User;
			return res.json([
				Object.fromEntries(
					Object.entries(Limits.limitsForUser(user.id)).map(([key, coin]) => {
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

		const app = express();
		app.use(express.json());
		app.use(
			session({
				secret: config.auth.session.secret,
				resave: true,
				saveUninitialized: true,
				store: MongoStore.create({ client: mongoose.connection.getClient() }),
			})
		);
		app.use(passport.initialize());
		app.use(passport.session());
		app.use('/api/auth', authRouter);

		app.use('/api/wallets', authCheckMiddleware, walltesRouter);
		app.use('/api/limits', authCheckMiddleware, limitsRouter);
		app.use('/api/users', authCheckMiddleware, usersRouter);

		app.listen(config.api.port, () => {
			console.log(`server is listening on ${config.api.port}`);
		});
	})
	.catch(console.error);
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
