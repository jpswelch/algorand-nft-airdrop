// @ts-nocheck
import algosdk from 'algosdk';
import { useState, useEffect } from 'react';
import {
  Grid,
  Box,
  Button,
  Typography
} from '@mui/material';
import {
  getDatabase,
  ref,
  set,
  child,
  push,
  update,
  onValue,
} from 'firebase/database';
import CardList from './card-list-component';

type supporterViewProps = {
  algodClient: algosdk.Algodv2;
  accountSettings: SessionWalletData;
};
const token = {
  'X-API-Key': import.meta.env.VITE_NETWORK_API_KEY,
};
const indexerClient = new algosdk.Indexer(
  token,
  import.meta.env.VITE_NETWORK_INDEXER,
  ''
);
export function SupporterView(props: supporterViewProps) {
  const { algodClient, accountSettings } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const [assetArray, setAssetArray] = useState<Object[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const [optedIn, setOptedIn] = useState<boolean>(false);
  let supporter = accountSettings?.data?.acctList[0];

  const handleSelected = (event: SelectChangeEvent<typeof selectedAsset>) => {
    setSelectedAsset(event.target.value);
  };


  const [availableAssets, setAvailableAssets] = useState<AssetObj[]>([]);

  const getAsset = async (id: number) => {
    return new Promise((resolve, reject) => {
      const asset = indexerClient
        .lookupAssetByID(id)
        .do()
        .then((result) => {
          resolve(result.asset);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  };


  useEffect(() => {
    setLoading(true);
    const db = getDatabase();
    const airdropRef = ref(db, 'airdrop');
    onValue(airdropRef, (snapshot: any) => {
      const datarec = snapshot.val();

      let array = [];
      let value;
      let assetArray: any = [];
      let res_image: string = '';
      let url: string = '';
      let d: string = '';
      for (let key in datarec) {
        value = datarec[key];
        let assetId: string = datarec[key].assetId;
        array.push({ key, ...value });
        getAsset(assetId).then((result: any) => {
          url = 'https://gateway.ipfs.io/ipfs/' + result.params.url;
          // console.log(url);
          fetch(url)
            .then((response) => response.text())
            .then((data) => {
              res_image = JSON.parse(data).image;
              console.log(JSON.parse(data).image);
              let a = {
                index: assetId,
                name: result.params['unit-name'],
                url: result.params.url,
                image: res_image,
              };
              assetArray = [...assetArray, a]
              // console.log(assetArray);
              setAvailableAssets(assetArray);
            })
            .catch((error) => {
              console.error('Error', error);
            });
        });
      }
      console.log("dev", assetArray)
      setLoading(false);
      // updateStarCount(postElement, data);
    });
  }, []);



  return (
    <div className="App">
      <Typography sx={{ mr: "100px", paddingBottom: "20px" }} variant="h3" component="h3" align='center'>NFTs up for giveaway!</Typography>
      <Typography sx={{ mr: "100px", paddingBottom: "20px" }} variant="h5" component="h5" align='center'>Opt in before a winner is randomly picked and the NFT is airdropped!</Typography>
      <Grid sx={{ mr: "130px" }}>
        {
          availableAssets.length && !loading ? <Box>
            <CardList assets={availableAssets} supporter={supporter} algodClient={algodClient} />
          </Box> : ""
        }
      </Grid>
    </div>
  );
}
