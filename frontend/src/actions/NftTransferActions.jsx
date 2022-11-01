/* global AlgoSigner */
import algosdk from "algosdk";

export const transferAsset = async (creator, winner, algodClient, assetId) => {
  let params = await algodClient.getTransactionParams().do();

  let sender = creator;
  let recipient = winner;
  let revocationTarget = undefined;
  let closeRemainderTo = undefined;
  //Amount of the asset to transfer
  let amount = 1;
  let note = undefined;
  // signing and sending "txn" will send "amount" assets from "sender" to "recipient"
  let txn = algosdk.makeAssetTransferTxnWithSuggestedParams(
    sender,
    recipient,
    closeRemainderTo,
    revocationTarget,
    amount,
    note,
    assetId,
    params
  );
  // Must be signed by the account sending the asset

  let txn_b64 = AlgoSigner.encoding.msgpackToBase64(txn.toByte());
  let rawSignedTxn = await AlgoSigner.signTxn([{ txn: txn_b64 }]);
  let binarySignedTx = AlgoSigner.encoding.base64ToMsgpack(
    rawSignedTxn[0].blob
  );

  let tx = await algodClient.sendRawTransaction(binarySignedTx).do();
  console.log("here", binarySignedTx);

  let assetID = null;

  const ptx = await algosdk.waitForConfirmation(algodClient, tx.txId, 4);
  // Get the new asset's information from the creator account
  assetID = ptx["asset-index"];
  //Get the completed Transaction
  let compTxn =
    "Transaction " + tx.txId + " confirmed in round " + ptx["confirmed-round"];
  console.log(compTxn);
  return compTxn;
};
