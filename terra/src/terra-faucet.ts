import {LCDClient, MsgSend, Coin, Coins, MsgSwap, Wallet, MnemonicKey}  from "@terra-money/terra.js";

function createWallet(mnemonic: string, gasType: string, gas: number) {

    const gasCoins = new Coins([new Coin('u'+gasType, (1000000*gas).toString())]);  

    const terra = new LCDClient({
        URL: "https://bombay-lcd.terra.dev/",
        chainID: "bombay-12",
        gasPrices: gasCoins,
      });

    const wallet = terra.wallet(new MnemonicKey({mnemonic:mnemonic}));
    return {terra, wallet};

}

async function swapTokens(terraClient: LCDClient, wallet: Wallet, fromTokens: string, toTokens: string, amount: number) {

    const swapCoin = new Coin('u'+fromTokens, (1000000*amount).toString());

    const swap = new MsgSwap(
        wallet.key.accAddress,
        swapCoin,
        'u' + toTokens
      );
      
      await wallet.createAndSignTx({ msgs: [swap] }).then(tx => terraClient.tx.broadcast(tx))
      .then(console.info)
      .catch((err) => {
        if (err.response) {
          console.error(err.response.data);
        } else {
          console.error(err.message);
        }
      });
    
}

async function terraSender(terraClient: LCDClient, wallet: Wallet, toWallet: string, tokenType: string, amount: number) {

  const sendingCoins = new Coins([new Coin('u'+tokenType, (1000000*amount).toString())]);
  
  const my_tx = new MsgSend(wallet.key.accAddress, toWallet, sendingCoins);

  await wallet.createAndSignTx({msgs: [my_tx]}).then(tx => terraClient.tx.broadcast(tx))
  .then(console.info)
  .catch((err) => {
    if (err.response) {
      console.error(err.response.data);
    } else {
      console.error(err.message);
    }
  });
}

const mnemonic = "there oil victory surface globe cross column barely food world vendor lizard wish transfer assault strong clerk visit fluid shrimp tobacco renew false defy";
const {terra, wallet} = createWallet(mnemonic, 'luna', 0.0001);

//swapTokens(terra, wallet, 'luna', 'usd', 250);
terraSender(terra, wallet, "terra1axmdadm204mcyh4vqstgjl59us9tc3cah78s3j", 'luna', 100);