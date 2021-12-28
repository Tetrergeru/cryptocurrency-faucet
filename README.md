# cryptocurrency-faucet

## Development

- Node.js 14 or higer
- yarn (`npm install --global yarn`)

Next commands should be use in directories 'client' or 'server'
- `yarn install` - download dependecies
- `yarn start` - run development environment
- `yarn fint` - run linter and formatter with autofixes
- `yarn format` - run formatter with autofix
- `yarn lint` - run liner
- `yarn build` - compile project and save in `build` folder

## Configuration
### Server
Server can be configured via environment variables.

| Name                            | Default                         | Type            | Description                    |
| ------------------------------- | ------------------------------- | --------------- | ------------------------------ |
| APP_API_HOST                    | `localhost`                     | string          |                                |
| APP_API_PORT                    | `2000`                          | number          | Port for serve web api service |
| APP_WALLETS_DEBUG               | `false`                         | boolean         |                                |
| APP_WALLETS_DEBUGLIMITS         | `50`                            | number          |                                |
| APP_WALLETS_GOERLI_PROVIDER     |                                 | string          |                                |
| APP_WALLETS_GOERLI_ADDRESS      |                                 | string          | Public address of wallet       |
| APP_WALLETS_GOERLI_PRIVATEKEY   |                                 | string          | Private key of ether wallet    |
| APP_WALLETS_GOERLI_LIMIT        | `0.1`                           | string          |                                |
| APP_WALLETS_BOMBAY_LIMIT        | `1  `                           | string          |                                |
| APP_WALLETS_BOMBAY_MNEMONICKEY  |                                 | string          | Mnemonic key of terra wallet   |
| APP_WALLETS_BOMBAY_CHAINID      | `bombay-12 `                    | string          |                                |
| APP_WALLETS_BOMBAY_DENOM        | `usd`                           | string          |                                |
| APP_WALLETS_BOMBAY_LCDCLIENTURL | `https://bombay-lcd.terra.dev/` | string          |                                |
| APP_AUTH_SESSION_SECRET         |                                 | string          | Secret for users sessions      |
| APP_AUTH_GITHUB_ORGANIZATIONS   |                                 | array of string | List of trusted organizations  |
| APP_AUTH_GITHUB_CLIENTID        |                                 | string          |                                |
| APP_AUTH_GITHUB_CLIENTSECRET    |                                 | string          |                                |
| APP_AUTH_GITHUB_CALLBACKURL     |                                 | string          |                                |
| APP_DATABASE_HOST               |                                 | string          |                                |
| APP_DATABASE_USER               |                                 | string          |                                |
| APP_DATABASE_PASSWORD           |                                 | string          |                                |


In development mode envs can be configured in `.env` file (place file in server directory).

```env
APP_API_PORT=2000
```
