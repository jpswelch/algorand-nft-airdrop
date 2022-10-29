// @ts-nocheck
import algosdk from "algosdk";
import { useState, useEffect } from "react";
import { Button, Grid, Stack, Typography, Switch } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { NftForm } from "./NftForm";

const baseServer = import.meta.env.VITE_NETWORK_API;

const port = "";

const token = {
  "X-API-key": "YESQtd0VR4RK9nF9LzFb3a5DUdmD1db7wnOPTCr6",
};
const indexerClient = new algosdk.Indexer(token, baseServer, port);

export type AwardData = {
  holders: Array;
};
type creatorViewProps = {
  algodClient: algosdk.Algodv2;
  network: string;
  accountSettings: SessionWalletData;
};

export function CreatorView(props: creatorViewProps) {
  const { algodClient, network, accountSettings } = props;

  const [assets, setAssets] = useState([]);
  const [holders, setHolders] = useState([]);
  const [fetch, setFetch] = useState(false);
  let address = accountSettings?.data?.acctList[0];
  //let address = "TIMPJ6P5FZRNNKYJLAYD44XFOSUWEOUAR6NRWJMQR66BRM3QH7UUWEHA24"; //placeholder until wallet connect
  // console.log(address);

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingF, setLoadingF] = useState<boolean>(false);

  const [isMintAsset, setIsMintAssetr] = useState<boolean>(true);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsMintAssetr(event.target.checked);
  };

  async function submit() {
    setLoading(true);
    await props.awardWinner({ holders: holders });

    setLoading(false);
  }

  useEffect(() => {
    const fetchAssets = async () => {
      setLoadingF(true);
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
    return new Promise((resolve) => setTimeout(resolve, delayInms));
  };
  useEffect(() => {
    let count = 0;
    let totalHolders = [];
    const fetchHolders = async () => {
      console.log(count);
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
        totalHolders = [...totalHolders, ...assetInfo.balances];
        count++;

        //avoid rate limiting by spacing out indexer calls a bit
        await delay(250);
      }
      setLoadingF(false);
      setHolders(totalHolders);
    };
    if (assets.length && assets.length !== count) {
      console.log(fetch, assets.length, count);
      fetchHolders();
    }
  }, [address, assets]);
  console.log(isMintAsset);

  return (
    <div className="App">
      <Grid>
        <Grid item lg>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography>Giveaway Asset</Typography>
            <Switch onChange={handleChange} checked={isMintAsset} />
            <Typography> Mint Asset</Typography>
          </Stack>

          {isMintAsset ? (
            <NftForm algodClient={algodClient} creator={address} />
          ) : holders.length && !loadingF ? (
            <Grid item lg>
              You have {holders.length} holders currently
            </Grid>
          ) : (
            <LoadingButton
              variant="contained"
              loading={loadingF}
              onClick={() => setFetch(true)}
            >
              Fetch Holders
            </LoadingButton>
          )}
        </Grid>
        <Grid item lg>
          <Button variant="contained" onClick={submit}>
            Airdrop
          </Button>
        </Grid>
      </Grid>
    </div>
  );
}
