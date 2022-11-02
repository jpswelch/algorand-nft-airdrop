import React, { useState, useEffect } from 'react';
import algosdk from 'algosdk';
import {
  Grid,
  Box,
  Button,
  FormControl,
  InputLabel,
  Input,
  FormHelperText,
  Typography,
  TextField,
  TextareaAutosize,
} from '@mui/material';

import { airdropNFT } from '../actions/NftCreateActions';
import firebase from '../firebase';
import {
  getDatabase,
  ref,
  set,
  child,
  push,
  update,
  onValue,
} from 'firebase/database';

function writeData(
  creator: string,
  assetId: string,
  donated: boolean,
  receiver: string
) {
  const db = getDatabase();

  let newKey: any = push(child(ref(db), 'airdrop')).key;

  const data: {
    creator: string;
    assetId: string;
    donated: boolean;
    receiver: string;
  } = {
    creator: creator,
    assetId: assetId,
    donated: donated,
    receiver: receiver,
  };

  const updates: {
    [key: string]: {
      creator: string;
      assetId: string;
      donated: boolean;
      receiver: string;
    };
  } = {};

  updates['/airdrop/' + newKey] = data;
  update(ref(db), updates);
}

function displayData() {
  const db = getDatabase();
  const airdropRef = ref(db, 'airdrop');
  onValue(airdropRef, (snapshot: any) => {
    const data = snapshot.val();
    console.log(data);
    // updateStarCount(postElement, data);
  });
}

function updateData(key: string, donated: boolean, receiver: string) {
  const db = getDatabase();
  const updates: {
    [key: string]: boolean;
  } = {};
  updates['/airdrop/' + key + '/donated'] = donated;
  const r_updates: {
    [key: string]: string;
  } = {};
  r_updates['/airdrop/' + key + '/receiver'] = receiver;
  update(ref(db), updates);
  update(ref(db), r_updates);
}

export type NftFormProps = {
  algodClient: algosdk.Algodv2;
  winner: string;
  creator: string;
};

export const NftForm = (props: NftFormProps) => {
  const [photo, setPhotoData] = useState<any>();
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  useEffect(() => {
    // initialize firebase
    console.log(firebase);
  }, []);

  let handleSubmit = async (e) => {
    e.preventDefault();
    let assetId = await airdropNFT(
      props.creator,
      title,
      description,
      photo,
      props.algodClient,
      props.winner
    );
    if (assetId) {
      console.log('Minting is complete');
      alert('Minting is complete!');
      writeData(props.creator, assetId, false, '');
    } else {
      alert('Minting failed!');
    }
  };
  return (
    <Grid>
      <Grid>
        <Box>
          <Typography variant="h5">Create an NFT</Typography>
        </Box>
      </Grid>

      <Grid>
        <FormControl>
          <TextField
            id="title"
            size="lg"
            placeholder="Enter Title"
            value={title}
            variant="outlined"
            fullWidth
            onChange={(e) => setTitle(e.target.value)}
          />
          {/* <Input
          id="title"
          size="md"
          placeholder="Enter Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        /> */}
          <FormControl />
          <FormControl>
            {/* <InputLabel>Description</InputLabel> */}
            {/* <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          /> */}
            <TextField
              minRows={6}
              id="description"
              value={description}
              multiline
              placeholder="Description"
              fullWidth
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <Input
              type="file"
              fullWidth
              onChange={(e) => setPhotoData(e.target.files[0])}
              hidden
            />
          </FormControl>
        </FormControl>
      </Grid>

      <Grid>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Submit
        </Button>
      </Grid>
    </Grid>
  );
};
