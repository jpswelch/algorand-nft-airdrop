import React, { useState } from "react";
import algosdk from "algosdk";
import {
  Button,
  FormControl,
  InputLabel,
  Input,
  FormHelperText,
} from "@mui/material";

import { airdropNFT } from "./actions/NftCreateActions";

export type NftFormProps = {
  algodClient: algosdk.Algodv2;
  winner: string;
  creator: string;
};

export const NftForm = (props: NftFormProps) => {
  const [photo, setPhotoData] = useState<any>();
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  let handleSubmit = async (e) => {
    e.preventDefault();
    let txn = await airdropNFT(
      props.creator,
      title,
      description,
      photo,
      props.algodClient,
      props.winner
    );
    if (txn) {
      alert("Minting is complete!");
    } else {
      alert("Minting failed!");
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
