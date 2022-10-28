import { create as ipfsClient } from "ipfs-http-client";
import algosdk from "algosdk";
const projectId = ""; //put infura id
const projectSecret = ""; //put infura secret
const auth =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");
const client = ipfsClient({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});
export const airdropNFT = async (
  creator,
  name,
  description,
  image,
  algodClient,
  winner
) => {
  try {
    const gateway = await ipfsUpload(name, description, image);
    const tokenURI = gateway;
    console.log("GATEWAY", gateway);
    let txn = await createAsset(creator, name, tokenURI, algodClient, winner);

    return txn;
  } catch (e) {
    console.log(e);
    return false;
  }
};

export const ipfsUpload = async (name, description, image) => {
  let imagePath = await ipfsImageUpload(image);
  const files = {
    path: "/",
    content: JSON.stringify({
      name: name,
      image: imagePath,
      description: description,
    }),
  };
  console.log(files);
  const result = await client.add(files);
  return result.path;
};

export const ipfsImageUpload = async (image) => {
  const result = await client.add(image);
  let imagePath = `https://gateway.ipfs.io/ipfs/${result.path}`;
  return imagePath;
};

export const createAsset = async (creator, name, ipfs, algodClient, winner) => {
  console.log(creator);
  let params = await algodClient.getTransactionParams().do();
  // comment out the next two lines to use suggested fee
  // params.fee = 1000;
  // params.flatFee = true;
  let note = undefined; // arbitrary data to be stored in the transaction; here, none is stored
  // Asset creation specific parameters
  // The following parameters are asset specific
  // Throughout the example these will be re-used.
  // We will also change the manager later in the example
  let addr = creator;
  // Whether user accounts will need to be unfrozen before transacting
  let defaultFrozen = false;
  // integer number of decimals for asset unit calculation
  let decimals = 0;
  // total number of this asset available for circulation
  let totalIssuance = 1;
  // Used to display asset units to user
  let unitName = name;
  // Friendly name of the asset
  let assetName = name;
  // Optional string pointing to a URL relating to the asset
  let assetURL = ipfs;
  // Optional hash commitment of some sort relating to the asset. 32 character length.
  let assetMetadataHash = "16efaa3924a6fd9d3a4824799a4ac65d";
  // The following parameters are the only ones
  // that can be changed, and they have to be changed
  // by the current manager
  // Specified address can change reserve, freeze, clawback, and manager
  let manager = undefined;
  // Specified address is considered the asset reserve
  // (it has no special privileges, this is only informational)
  let reserve = undefined;
  // Specified address can freeze or unfreeze user asset holdings
  let freeze = undefined;
  // Specified address can revoke user asset holdings and send
  // them to other addresses
  let clawback = undefined;

  // signing and sending "txn" allows "addr" to create an asset
  let txn = algosdk.makeAssetCreateTxnWithSuggestedParams(
    addr,
    note,
    totalIssuance,
    decimals,
    defaultFrozen,
    manager,
    reserve,
    freeze,
    clawback,
    unitName,
    assetName,
    assetURL,
    assetMetadataHash,
    params
  );
  let rawSignedTxn = txn.signTxn(); //TODO how to use connected wallet for this?
  let tx = await algodClient.sendRawTransaction(rawSignedTxn).do();

  let assetID = null;
  // wait for transaction to be confirmed
  const ptx = await algosdk.waitForConfirmation(algodClient, tx.txId, 4);
  // Get the new asset's information from the creator account
  assetID = ptx["asset-index"];
  //Get the completed Transaction
  let compTxn =
    "Transaction " + tx.txId + " confirmed in round " + ptx["confirmed-round"];
  console.log(compTxn);
  return compTxn;
};
