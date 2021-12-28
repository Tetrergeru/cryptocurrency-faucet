/* eslint-disable no-unused-vars */
const defaultConfig = {
	api: {
		host: 'localhost',
		port: 2000,
	},
	wallets: {
		debug: false,
		debugLimits: 50,
		goerli: {
			provider: '',
			address: '',
			privateKey: '',
			limit: '0.1',
		},
		bombay: {
			limit: '1',
			mnemonicKey: '',
			chainID: 'bombay-12',
			denom: 'usd',
			LCDClientURL: 'https://bombay-lcd.terra.dev/',
		},
	},
	auth: {
		session: {
			secret: '',
		},
		github: {
			clientID: '',
			clientSecret: '',
			callbackURL: '',
			organizations: [''],
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


function inOperator<K extends PropertyKey, K2 extends K>(k: K, o: Record<K2, unknown>): k is K2 {
	return k in o;
}

class EnvError extends Error {
	constructor(envName: string, envType: string) {
		super(`Environment variable '${envName} should be ${envType}`)
	}
}

const envParsersByType = {
	string: (defaultValue: string, env: string | undefined) => env || defaultValue,
	number: (defaultValue: number, env: string | undefined) => parseIntOrDefault(env || '', defaultValue),
	boolean: (defaultValue: boolean, env: string | undefined) =>
		env === undefined ? defaultValue : env === 'true',
};

function getEnvParser<T>(defaultValue: T): (((env: string | undefined) => T) | undefined) {
	const typeofValue = typeof defaultValue;
	if (inOperator(typeofValue, envParsersByType)) {
		return (envParsersByType[typeofValue] as unknown as ((defaultValue: T, env: string | undefined) => T))
			.bind(envParsersByType, defaultValue);
	}
	return undefined;
}

function readEnvConfig<T extends object>(prefix: string, defaultConfig: T): T {
	return Object.fromEntries(
		Object.entries(defaultConfig).map(([key, defaultValue]) => {
			const envKey = `${prefix}_${key.toUpperCase()}`;
			if (Array.isArray(defaultValue)) {
				const value = process.env[envKey];
				if (value === undefined) {
					throw new EnvError(envKey, `array of ${typeof defaultValue[0]} (delimeter: ,)`)
				}
				const parser = getEnvParser(defaultValue[0]);
				if (parser)
					return [key, value.split(",").map(parser)]
			} else if (typeof defaultValue === "object")
				return [key, readEnvConfig(envKey, defaultValue)];
			const parser = getEnvParser(defaultValue);
			if (parser) {
				return [key, parser(process.env[envKey])];
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
			if(Array.isArray(defaultValue)) {
				return {key: envKey, default: defaultValue.join(","), type: `array of ${typeof defaultValue[0]}`}
			}
			switch (typeof defaultValue) {
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

/*const help = helpEnvConfig('APP', defaultConfig);
const maxKeyLength = Math.max(...help.map(({key}) => key.length))
const maxDefaultLength = Math.max(...help.map((x) => x.default.toString().length))
const maxTypeLength = Math.max(...help.map((x) => x.type.length))
console.log([
	{key: "Name", default: "Default", type: "Type"},
	{key: "".padEnd(maxKeyLength, "-"), default: "".padEnd(maxDefaultLength, "-"), type: "".padEnd(maxTypeLength, "-")},
].concat(help).map(x=>`| ${x.key.padEnd(maxKeyLength)} | ${x.default.toString().padEnd(maxDefaultLength)} | ${x.type.padEnd(maxTypeLength)} |`).join("\n"));
*/
export default readEnvConfig('APP', defaultConfig);
