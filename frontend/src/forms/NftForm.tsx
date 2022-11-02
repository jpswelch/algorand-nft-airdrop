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

import { makeStyles } from '@mui/styles'

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
import { ClassNames } from '@emotion/react';

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


const useStyles = makeStyles({
  input: {
    color: "white"
  }
});

export const NftForm = (props: NftFormProps) => {
  const [photo, setPhotoData] = useState<any>();
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const classes = useStyles();

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
  const inputProps = {
    color: "white",
  };

  return (
    <>
      <Grid container
        direction="column"
        alignItems="center"
        justifyContent="center"
        spacing={6}
        margin="10px"
        color="secondary"
        sx={{ backgroundColor: 'secondary.main', borderRadius: "30px", padding: "10px", }}
      >
        <FormControl margin={'normal'} >
          <TextField
            id="title"
            size="lg"
            placeholder="Enter Title"
            value={title}
            variant="outlined"
            fullWidth
            inputProps={{ className: classes.input }}
            color={"info"}
            onChange={(e) => setTitle(e.target.value)} />
          <FormControl />
          <FormControl margin={'normal'}>
            <TextField
              minRows={6}
              id="description"
              value={description}
              multiline
              placeholder="Description"
              inputProps={{ className: classes.input }}
              color={"info"}
              fullWidth
              onChange={(e) => setDescription(e.target.value)} />
          </FormControl>
          <FormControl margin={'normal'}>
            <Input
              type="file"
              fullWidth
              inputProps={{ className: classes.input }}
              color={"info"}
              onChange={(e) => setPhotoData(e.target.files[0])}
              hidden />
          </FormControl>
        </FormControl>
      </Grid>
      <Box textAlign='center' marginLeft={"60px"} paddingTop={"20px"}>
        <Button onClick={handleSubmit} variant="contained" color="primary" >
          Submit
        </Button>
      </Box>
    </>
  );
};
