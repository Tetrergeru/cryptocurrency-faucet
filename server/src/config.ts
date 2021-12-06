import { Numeric } from '@terra-money/terra.js';
import { TerraFaucetSettings } from './wallets/terra';

const defaultConfig = {
	api: {
		host: 'localhost',
		port: 2000,
		url: 'https://localhost:3000',
	},
	wallets: {
		debug: true,
		debugLimits: 50,
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
	auth: {
		session: {
			secret: '',
		},
		github: {
			clientID: '',
			clientSecret: '',
			callbackURL: '',
			organization: '',
			admin: '',
		},
	},
	database: {
		host: '',
		user: '',
		password: '',
	},
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

function helpEnvConfig<T extends object>(
	prefix: string,
	defaultConfig: T
): { key: string; default: string; type: string }[] {
	return Object.entries(defaultConfig)
		.map(([key, defaultValue]) => {
			const envKey = `${prefix}_${key.toUpperCase()}`;
			switch (typeof defaultValue) {
				// TODO arrays
				case 'object':
					return helpEnvConfig(envKey, defaultValue);
				default:
					return [
						{ key: envKey, default: defaultValue, type: typeof defaultValue },
					];
			}
		})
		.flat();
}

// console.log(helpEnvConfig('APP', defaultConfig).map(x=>`${x.key}=${x.default}`).join("\n"));
export default readEnvConfig('APP', defaultConfig);
