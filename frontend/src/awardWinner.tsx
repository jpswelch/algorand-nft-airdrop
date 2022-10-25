
// @ts-nocheck
import algosdk from "algosdk";
import { useState, useEffect } from "react";

const baseServer = "https://mainnet-algorand.api.purestake.io/idx2";
const port = "";

const token = {
  "X-API-key": "YESQtd0VR4RK9nF9LzFb3a5DUdmD1db7wnOPTCr6",
};
const indexerClient = new algosdk.Indexer(token, baseServer, port);


export type AwardData = {
  holdersArrayLength: bigint;
};
type awardWinnerProps = {
  network: string;
  accountSettings: SessionWalletData;
  awardWinner(bfd: AwardData): void;
};

export function AwardWinner(props: awardWinnerProps) {
  const { network, accountSettings } = props;

  const [assets, setAssets] = useState([]);
  const [holders, setHolders] = useState([]);
  const [fetch, setFetch] = useState(false);
  //let address = accountSettings?.data?.acctList[0]
  let address = "TIMPJ6P5FZRNNKYJLAYD44XFOSUWEOUAR6NRWJMQR66BRM3QH7UUWEHA24"; //placeholder until wallet connect
  // console.log(address);

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingF, setLoadingF] = useState<boolean>(false);
  async function submit() {
    setLoading(true);
    await props.awardWinner({ holdersArrayLength: 2 });
    setLoading(false);
  }

  useEffect(() => {
    const fetchAssets = async () => {
      setLoadingF(true)
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
    if (address !== undefined && fetch) {
      setFetch(false);
      fetchAssets();
    }
  }, [address, fetch]);
  const delay = (delayInms) => {
    return new Promise(resolve => setTimeout(resolve, delayInms));
  }
  useEffect(() => {
    let count = 0;
    let totalHolders = [];
    const fetchHolders = async () => {
      for (let i = 0; i < assets.length; i++) {
        let assetInfo = await indexerClient
          .lookupAssetBalances(assets[i].index)
          .currencyGreaterThan(0)
          .limit(1)
          .do();
        console.log(assetInfo?.balances[0]?.address)
        if (assetInfo?.balances[0]?.address !== address) {
          //don't include creator in holders array
          totalHolders = [...totalHolders, ...assetInfo.balances];
        }
        totalHolders = [...totalHolders, ...assetInfo.balances];
        count++;

        //avoid rate limiting by spacing out indexer calls a bit
        await delay(250);
      }
      setHolders(totalHolders);
    };
    if (assets.length && assets.length !== count) {
      console.log(fetch, assets.length, count)
      fetchHolders();
    }
  }, [address, assets]);

  return (
    <div className="App">
      {assets.length ? `creator has ${holders.length} holders currently` : "creator has no holders"}
      <button onClick={() => setFetch(true)}>Fetch holders</button>
      <button onClick={submit}>Airdrop an exclusive nft?</button>
    </div>
  );
}
