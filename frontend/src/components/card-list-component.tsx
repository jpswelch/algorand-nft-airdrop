import { getAlgodClient } from 'beaker-ts/lib/clients';
import { Component } from 'react';
import Card from './card-component';
import './card-list.styles.css';

export default function CardList(props) {

  // console.log('render from cardlist component');
  const { assets, supporter, algodClient } = props
  console.log(assets)

  return (
    <div className="card-list">
      {assets.map((asset) => (
        <Card key={asset.index} asset={asset} supporter={supporter} algodClient={algodClient} />
      ))}
    </div>


  );
}
