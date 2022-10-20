import "./App.css";
import { useEffect, useState } from "react";

const algosdk = require("algosdk"); // new
const baseServer = "https://mainnet-algorand.api.purestake.io/idx2";
const port = "";

const token = {
  "X-API-key": process.env.REACT_APP_PURESTAKE_KEY,
};
const indexerClient = new algosdk.Indexer(token, baseServer, port);

function App() {
  const [holders, setHolders] = useState([]);
  const [start, setStart] = useState(false);
  const address = "TIMPJ6P5FZRNNKYJLAYD44XFOSUWEOUAR6NRWJMQR66BRM3QH7UUWEHA24"; //placeholder until wallet connect

  useEffect(() => {
    const fetchHolders = async () => {
      let totalRes;

      let assetInfo = await indexerClient
        .lookupAccountCreatedAssets(address)
        .do();

      totalRes = [...assetInfo.assets];
      //console.log([...assetInfo.assets, ...assetInfo.assets]);
      while ("next-token" in assetInfo) {
        assetInfo = await indexerClient
          .lookupAccountCreatedAssets(address)
          .nextToken(assetInfo["next-token"])
          .do();
        totalRes = [...totalRes, ...assetInfo.assets];
      }
      setHolders(totalRes);
    };
    if (start) {
      setStart(false);
      fetchHolders();
    }
  }, [holders, start]);
  console.log(holders);
  //placeholder until walletconnect
  return (
    <div className="App">
      <h1>NFT AirDrop</h1>
      <button onClick={() => setStart(true)}>fetch</button>
      {holders.length ? `creator has ${holders.length} holders currently` : ""}
    </div>
  );
}

export default App;
