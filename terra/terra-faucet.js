import {LCDClient, MnemonicKey, MsgSend} from "@terra-money/terra.js";

async function terra_faucet(to_wallet, token_type, amount) {

  const terra = new LCDClient({
    URL: "https://bombay-lcd.terra.dev/",
    chainID: "bombay-12",
  });

  // Granter (terra1maqmnzxcxg4vee7qggjgpwwj2ej45xg30zrsvd)
  const faucet_wallet = terra.wallet(
    new MnemonicKey({
      mnemonic:
        "practice enhance suffer vital enforce deposit install car deer trade tent bid brave size ride play valid throw image copy panther brick rhythm west",
    })
  );

  const my_tx = new MsgSend("terra1maqmnzxcxg4vee7qggjgpwwj2ej45xg30zrsvd", to_wallet,
    (1000000*amount).toString()+'u'+token_type);

  await faucet_wallet.createAndSignTx({
    msgs: [my_tx],
    memo: "test sending"
  }).then(tx => terra.tx.broadcast(tx)).then(console.info)
  .catch((err) => {
    if (err.response) {
      console.error(err.response.data);
    } else {
      console.error(err.message);
    }
  });
}

terra_faucet("terra1axmdadm204mcyh4vqstgjl59us9tc3cah78s3j",'usd', 100).catch(console.error);