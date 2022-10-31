// @ts-nocheck
import algosdk from "algosdk";
import { useState, useEffect } from "react";
import { Grid, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { optInToAsset } from "./actions/SupporterOptInActions";
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
import { display } from "@mui/system";

type supporterViewProps = {
  algodClient: algosdk.Algodv2;
  accountSettings: SessionWalletData;
};

export function SupporterView(props: supporterViewProps) {
  const { algodClient, accountSettings } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const [assetArray, setAssetArray] = useState<Object[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<string>("");
  const [optedIn, setOptedIn] = useState<boolean>(false);
  let supporter = accountSettings?.data?.acctList[0];

  const handleChange = (event: SelectChangeEvent<typeof selectedAsset>) => {
    setSelectedAsset(event.target.value);
  };

  async function optIn() {
    setLoading(true);
    await optInToAsset(supporter, selectedAsset, algodClient);
    setOptedIn(true);
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
        array.push({ key, ...value });
      }
      setAssetArray(array);
      // updateStarCount(postElement, data);
    });
  }, []);
  console.log(assetArray);
  return (
    <div className="App">
      <Grid>
        <Grid item lg>
          {assetArray ? (
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">AssetId</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                label="AssetId"
                onChange={handleChange}
              >
                {assetArray.map((asset) => (
                  <MenuItem key={asset.assetId} value={asset.assetId}>
                    {asset.assetId}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            ""
          )}
          {optedIn ? (
            <Button> Opted In!</Button>
          ) : (
            <LoadingButton
              variant="contained"
              onClick={optIn}
              loading={loading}
            >
              Opt in
            </LoadingButton>
          )}
        </Grid>
      </Grid>
    </div>
  );
}
