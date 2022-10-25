
// @ts-nocheck
import algosdk from "algosdk";
import { useState, useEffect } from "react";

const baseServer = "https://mainnet-algorand.api.purestake.io/idx2";
const port = "";

const token = {
  "X-API-key": "",
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

  let address = accountSettings?.data?.acctList[0]
  //address = "TIMPJ6P5FZRNNKYJLAYD44XFOSUWEOUAR6NRWJMQR66BRM3QH7UUWEHA24"; //placeholder until wallet connect
  // console.log(address);

  const [loading, setLoading] = useState<boolean>(false);

  async function submit() {
    setLoading(true);
    console.log(holders.length)
    await props.awardWinner({ holdersArrayLength: holders.length });
    setLoading(false);
  }

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
    if (address !== undefined) {
      fetchAssets();
    }
  }, [address]);

  useEffect(() => {
    let totalHolders = [];
    let count = 0;
    const fetchHolders = async () => {
      for (let i = 0; i < assets.length; i++) {
        let assetInfo = await indexerClient
          .lookupAssetBalances(assets[i].index)
          .currencyGreaterThan(0)
          .limit(1)
          .do();
        if (assetInfo?.balances[0]?.address !== address) {
          //don't include creator in holders array
          totalHolders = [...totalHolders, ...assetInfo.balances];
        }
        count++;
      }
      setHolders(totalHolders);
    };
    if (assets.length && assets.length !== count) {
      fetchHolders();
    }
  }, [address, assets]);

  //placeholder until walletconnect
  return (
    <div className="App">
      {assets.length ? `creator has ${holders.length} holders currently` : "creator has no holders"}
      <button onClick={submit}>Airdrop an exclusive nft?</button>
    </div>
  );
}
