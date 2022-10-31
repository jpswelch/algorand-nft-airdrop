import React, { useState, useEffect } from 'react';
import algosdk from 'algosdk';
import {
  Button,
  FormControl,
  InputLabel,
  Input,
  FormHelperText,
} from '@mui/material';

import { airdropNFT } from './actions/NftCreateActions';
import firebase from './firebase';
import {
  getDatabase,
  ref,
  set,
  child,
  push,
  update,
  onValue,
} from 'firebase/database';

function writeData(creator: string, assetId: string, donated: boolean) {
  const db = getDatabase();

  let newKey: any = push(child(ref(db), 'airdrop')).key;

  const data: {
    creator: string;
    assetId: string;
    donated: boolean;
  } = {
    creator: creator,
    assetId: assetId,
    donated: donated,
  };

  const updates: {
    [key: string]: {
      creator: string;
      assetId: string;
      donated: boolean;
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

function updateData(key: string, donated: boolean) {
  const db = getDatabase();
  const updates: {
    [key: string]: boolean;
  } = {};
  updates['/airdrop/' + key + '/donated'] = donated;
  update(ref(db), updates);
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
      writeData(props.creator, assetId, false);
    } else {
      alert('Minting failed!');
    }
  };
  return (
    <div>
      <h1>Build your award NFT </h1>
      <FormControl>
        <InputLabel>Title</InputLabel>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <FormControl />
        <FormControl>
          <InputLabel>Description</InputLabel>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </FormControl>
        <FormControl>
          <Input
            type="file"
            onChange={(e) => setPhotoData(e.target.files[0])}
            hidden
          />
        </FormControl>
      </FormControl>

      <div>
        <Button onClick={handleSubmit}>Submit</Button>
      </div>
    </div>
  );
};
