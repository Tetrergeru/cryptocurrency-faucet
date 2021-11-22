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

| Name                          | Default | Description                               |
| ----------------------------- | ------- | ----------------------------------------- |
| APP_API_PORT                  | `2000`  | Port for serve web api service            |
| APP_WALLETS_GOERLI_PROVIDER   | `""`    | `https://goerli.infura.io/v3/bla-bla-bla` |
| APP_WALLETS_GOERLI_ADDRESS    | `""`    | Public address of wallet                  |
| APP_WALLETS_GOERLI_PRIVATEKEY | `""`    | Private key of wallet                     |

In development mode envs can be configured in `.env` file (place file in server directory).

```env
APP_API_PORT=2000
```
