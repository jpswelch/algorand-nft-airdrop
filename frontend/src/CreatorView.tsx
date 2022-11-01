// @ts-nocheck
import algosdk from "algosdk";
import { useState, useEffect } from "react";
import {
  Button,
  Grid,
  Stack,
  Typography,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { NftForm } from "./NftForm";
import firebase from "./firebase";
import {
  getDatabase,
  ref,
  set,
  child,
  push,
  update,
  onValue,
} from "firebase/database";

const baseServer = import.meta.env.VITE_NETWORK_API;

const port = "";

const token = {
  "X-API-key": "YESQtd0VR4RK9nF9LzFb3a5DUdmD1db7wnOPTCr6",
};
const indexerClient = new algosdk.Indexer(token, baseServer, port);

export type AwardData = {
  eligibleWinners: Array;
  assetId: number;
  assetKey: string;
};
type creatorViewProps = {
  algodClient: algosdk.Algodv2;
  network: string;
  accountSettings: SessionWalletData;
  awardWinner(bfd: AwardData): void;
};

export function CreatorView(props: creatorViewProps) {
  const { algodClient, network, accountSettings } = props;
  const [assetArray, setAssetArray] = useState<Object[]>([]);
  const [optedInLoading, setOptedInLoading] = useState(false);
  const [optedInArray, setOptedInArray] = useState<string[]>([]);

  let address = accountSettings?.data?.acctList[0];
  //let address = "TIMPJ6P5FZRNNKYJLAYD44XFOSUWEOUAR6NRWJMQR66BRM3QH7UUWEHA24"; //placeholder until wallet connect
  // console.log(address);

  const [loading, setLoading] = useState<boolean>(false);

  const [isMintAsset, setIsMintAsset] = useState<boolean>(true);
  const [selectedAsset, setSelectedAsset] = useState<string>("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsMintAsset(event.target.checked);
  };
  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedAsset(event.target.value);
  };

  async function submit() {
    setLoading(true);

    setLoading(false);
  }

  async function pickWinner() {
    setLoading(true);
    let totalAssets = [];

    let assetInfo = await indexerClient
      .lookupAccountCreatedAssets(address)
      .do();

    totalAssets = [...assetInfo.assets];
    while ("next-token" in assetInfo) {
      assetInfo = await indexerClient
        .lookupAccountCreatedAssets(address)
        .nextToken(assetInfo["next-token"])
        .do();
      totalAssets = [...totalAssets, ...assetInfo.assets];
    }
    //fetch holders of above assets
    let totalHolders = [];
    let eligibleWinners = [];
    for (let i = 0; i < totalAssets.length; i++) {
      let assetInfo = await indexerClient
        .lookupAssetBalances(totalAssets[i].index)
        .do();
      if (assetInfo?.balances[0]?.address !== address) {
        //don't include creator in holders array
        totalHolders = [...totalHolders, ...assetInfo.balances];
      }
      totalHolders = [...totalHolders, ...assetInfo.balances];
      //avoid rate limiting by spacing out indexer calls a bit
      await delay(250);
    }
    console.log(optedInArray, totalHolders);
    if (optedInArray.length) {
      for (let i = 0; i < optedInArray.length; i++) {
        if (
          totalHolders.some(
            (elementHold) => elementHold.address === optedInArray[i].address
          )
        ) {
          eligibleWinners.push(optedInArray[i]);
        }
      }
      // console.log(eligibleWinners);
    } else {
      alert("No one has opted into recieving this asset yet!");
    }

    // Show graphic

    //award winner

    const dbAsset = assetArray.find((ast) => {
      console.log(ast, ast.assetId == selectedAsset);
      return ast.assetId == selectedAsset;
    });
    console.log(dbAsset);

    await props.awardWinner({
      eligibleWinners: eligibleWinners,
      assetId: selectedAsset,
      assetKey: dbAsset.key,
    });

    setLoading(false);
  }

  useEffect(() => {
    const db = getDatabase();
    const airdropRef = ref(db, "airdrop");
    onValue(airdropRef, (snapshot: any) => {
      const data = snapshot.val();

      let array = [];
      let value;
      for (let key in data) {
        value = data[key];
        if (value.creator === address) {
          array.push({ key, ...value });
        }
      }
      setAssetArray(array);
      // updateStarCount(postElement, data);
    });
  }, []);

  const delay = (delayInms) => {
    return new Promise((resolve) => setTimeout(resolve, delayInms));
  };

  useEffect(() => {
    const fetchOptedIn = async () => {
      setOptedInLoading(true);

      let assetInfo = await indexerClient
        .lookupAssetBalances(selectedAsset)
        .do();

      let totalRes = assetInfo?.balances.filter((balance) => {
        return balance.amount === 0;
      });

      while ("next-token" in assetInfo) {
        assetInfo = await indexerClient
          .lookupAssetBalances(selectedAsset)
          .nextToken(assetInfo["next-token"])
          .do();
        let arr = assetInfo?.balances.filter((balance) => {
          balance.amount === 0;
        });
        totalRes = [...totalRes, ...arr];
      }
      setOptedInArray(totalRes);
      setOptedInLoading(false);
    };
    if (selectedAsset) {
      fetchOptedIn();
    }
  }, [selectedAsset]);

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
          ) : assetArray ? (
            <>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">AssetId</InputLabel>
                <Select
                  label="AssetId"
                  onChange={handleSelect}
                  value={selectedAsset}
                >
                  {assetArray.map((asset) =>
                    asset.donated ? (
                      <MenuItem
                        disabled
                        key={asset.assetId}
                        value={asset.assetId}
                      >
                        {asset.assetId}
                      </MenuItem>
                    ) : (
                      <MenuItem key={asset.assetId} value={asset.assetId}>
                        {asset.assetId}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
            </>
          ) : (
            "You do not have any Assets to give away! Head over to  the Mint asset page to start the process!"
          )}

          {optedInArray.length ? (
            <LoadingButton
              variant="contained"
              loading={loading}
              onClick={pickWinner}
            >
              Pick winner and transfer!
            </LoadingButton>
          ) : (
            ""
          )}
        </Grid>
      </Grid>
    </div>
  );
}
