/* global AlgoSigner */
import algosdk from "algosdk";

export const optInToAsset = async (supporter, assetId, algodClient) => {
  let params = await algodClient.getTransactionParams().do();
  // signing and sending "txn" allows "addr" to create an asset
  const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: supporter,
    to: supporter,
    assetIndex: assetId,
    note: AlgoSigner.encoding.stringToByteArray("Opting into recieve asset"),
    amount: 0,
    suggestedParams: { ...params },
  });

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
