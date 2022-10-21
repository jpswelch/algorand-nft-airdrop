import { useEffect, useState } from "react";

const algosdk = require("algosdk"); // new
const baseServer = "https://mainnet-algorand.api.purestake.io/idx2";
const port = "";

const token = {
  "X-API-key": process.env.REACT_APP_PURESTAKE_KEY,
};
const indexerClient = new algosdk.Indexer(token, baseServer, port);

function AwardWinner() {
  const [assets, setAssets] = useState([]);
  const [holders, setHolders] = useState([]);
  const [start, setStart] = useState(false);
  const address = "TIMPJ6P5FZRNNKYJLAYD44XFOSUWEOUAR6NRWJMQR66BRM3QH7UUWEHA24"; //placeholder until wallet connect

  useEffect(() => {
    const fetchAssets = async () => {
      let totalRes;

      let assetInfo = await indexerClient
        .lookupAccountCreatedAssets(address)
        .do();

      totalRes = [...assetInfo.assets];
      while ("next-token" in assetInfo) {
        assetInfo = await indexerClient
          .lookupAccountCreatedAssets(address)
          .nextToken(assetInfo["next-token"])
          .do();
        totalRes = [...totalRes, ...assetInfo.assets];
      }
      setAssets(totalRes);
    };
    if (start) {
      setStart(false);
      fetchAssets();
    }
  }, [start]);

  useEffect(() => {
    let totalHolders = [];
    const fetchHolders = async () => {
      for (let i = 0; i < assets.length; i++) {
        let assetInfo = await indexerClient
          .lookupAssetBalances(assets[i].index)
          .currencyGreaterThan(0)
          .limit(1)
          .do();
        totalHolders = [...totalHolders, ...assetInfo.balances];
        setHolders(totalHolders);
      }
    };
    if (assets) {
      fetchHolders();
    }
  }, [assets]);

  console.log(holders);
  //placeholder until walletconnect
  return (
    <div className="App">
      <button onClick={() => setStart(true)}>fetch</button>
      {assets.length ? `creator has ${assets.length} holders currently` : ""}
    </div>
  );
}

export default AwardWinner;
