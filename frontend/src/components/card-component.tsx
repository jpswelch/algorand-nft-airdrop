import { Component } from 'react';
import './card.styles.css';
import { Button } from '@mui/material';
class Card extends Component {
  render() {
    const { index, name, image } = this.props.asset;
    return (
      <div className="card-container" key={index}>
        <img key={index} alt={`asset ${name}`} src={`${image}`} />
        <h2>{name}</h2>
        <Button variant="contained">Opt In</Button>
      </div>
    );
  }
}

export default Card;
