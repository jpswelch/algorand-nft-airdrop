import { Component } from 'react';
import Card from './card-component';
// import './card-list.styles.css';

class CardList extends Component {
  render() {
    // console.log('render from cardlist component');
    const assets = this.props.assets;
    return (
      <div className="card-list">
        {assets.map((asset) => (
          <Card key={asset.index} asset={asset} />
        ))}
      </div>
    );
  }
}

export default CardList;
