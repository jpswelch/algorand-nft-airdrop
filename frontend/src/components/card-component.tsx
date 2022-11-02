import { Component, useState } from 'react';
import './card.styles.css';
import { Button, Box } from '@mui/material';
import { optInToAsset } from '../actions/SupporterOptInActions';
import { LoadingButton } from '@mui/lab';
export default function Card(props) {

  const { index, name, image } = props.asset;
  const { supporter, algodClient } = props

  const [loading, setLoading] = useState<boolean>(false);
  const [optedIn, setOptedIn] = useState<boolean>(false);

  async function optIn() {
    setLoading(true);
    await optInToAsset(supporter, index, algodClient);
    setOptedIn(true);
    setLoading(false);
  }
  return (
    <div className="card-container" key={index}>
      <Box
        component="img"
        sx={{
          height: 110,
        }}
        key={index} alt={`asset ${name}`} src={`${image}`}
      />
      {/* //<img key={index} alt={`asset ${name}`} src={`${image}`} /> */}
      <h2>{name}</h2>
      <LoadingButton loading={loading} variant="contained" onClick={optIn}>Opt In</LoadingButton>
    </div>
  );
}

