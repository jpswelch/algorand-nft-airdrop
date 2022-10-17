import { useEffect, useState } from "react";
import "./App.css";
import * as backend from "./build/index.main.mjs";
import { loadStdlib } from "@reach-sh/stdlib";
import { ALGO_WalletConnect as WalletConnect } from "@reach-sh/stdlib";
const reach = loadStdlib(process.env);
console.log("HELLLOOO");
var opts = {
  REACH_DEBUG: "Y",
  REACH_CONNECTOR_MODE: "ALGO-live",
  ALGO_SERVER: "https://academy-algod.dev.aws.algodev.network",
  ALGO_PORT: "",
  ALGO_TOKEN:
    "2f3203f21e738a1de6110eba6984f9d03e5a95d7a577b34616854064cf2c0e7b",
  ALGO_INDEXER_SERVER: "https://algoindexer.testnet.algoexplorerapi.io",
  ALGO_INDEXER_PORT: "",
  ALGO_INDEXER_TOKEN: "",
};

const stdlib = loadStdlib(opts);
stdlib.setWalletFallback(
  stdlib.walletFallback({
    providerEnv: "TestNet",
    WalletConnect,
  })
);

function App() {
  let [address, setAddress] = useState("");
  useEffect(() => {
    async function fetchData() {
      const acc = await reach.getDefaultAccount();
      setAddress(acc.getAddress());
    }
    fetchData();
  }, [address]);
  async function disconnectWallet() {
    await window.algorand.disconnect();
  }

  return (
    <div className="App">
      <h1>NFT AirDrop</h1>
      <h2> Address: {address}</h2>
      <button onClick={async () => await disconnectWallet()}>disconnect</button>
    </div>
  );
}

export default App;
