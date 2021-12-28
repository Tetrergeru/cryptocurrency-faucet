# cryptocurrency-faucet

## Deployment

To deploy this application you should use `docker-compose.yml` via docker compose.

Following environment variables must be defined:

 - `MONGO_INITDB_DATABASE` — Mongo database name (e.g. `cryptoloot`)
 - `MONGO_INITDB_ROOT_USERNAME` — Mongo root username (e.g. `root`)
 - `MONGO_INITDB_ROOT_PASSWORD` — Mongo root password (e.g. `to.hno{uwti462rnui`, please don't use this symbol sequense as an actual password)

 - `MONGO_VOLUME_PATH` — Path to volume, which mongo will use. (e.g. `./mongodb-volume`)

 - `APP_AUTH_GITHUB_ORGANIZATIONS` — List of coma separated github orgamisations, members of which will be allowed to use cryptoloot (e.g. `cryptoloot-test-org,some-other-organisation`)
 - `APP_AUTH_SESSION_SECRET` — The secret used to sign the session cookie.
 - `APP_AUTH_GITHUB_CLIENTID` — Github auth clent id (registered on github)
 - `APP_AUTH_GITHUB_CLIENTSECRET` — Github auth clent secret (registered on github)
 - `APP_WALLETS_GOERLI_PROVIDER` — Goerli wallet provider
 - `APP_WALLETS_GOERLI_ADDRESS` — Goerli wallet address
 - `APP_WALLETS_GOERLI_PRIVATEKEY` — Goerli wallet private key
 - `APP_WALLETS_BOMBAY_MNEMONICKEY` — Bombay walet mnemonic key
 - `APP_WALLETS_GOERLI_LIMIT` — Limit of Goerly that can be given away to faucet users (e.g. `0.2`)
 - `APP_WALLETS_BOMBAY_LIMIT` — Limit of Bombay that can be given away to faucet users (e.g. `10`)

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
