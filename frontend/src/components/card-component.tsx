import { Component } from 'react';
// import './card.styles.css';

class Card extends Component {
  render() {
    const { index, name, url } = this.props.asset;
    return (
      <div className="card-container" key={index}>
        <img alt={`asset ${name}`} src={`${image}`} />
        <h2>{name}</h2>
      </div>
    );
  }
}

export default Card;
