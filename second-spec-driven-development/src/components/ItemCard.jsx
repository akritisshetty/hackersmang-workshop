import { formatINR } from '../utils/format.js';

export default function ItemCard({ item, onAdd }) {
  return (
    <article className="item-card">
      <img className="item-image" src={item.image} alt={item.name} width={240} height={190} />
      <div className="item-card-body">
        <h2 className="item-name">{item.name}</h2>
        <p className="item-description">{item.description}</p>
        <p className="item-price">{formatINR(item.price)}</p>
        <button type="button" className="btn btn-primary btn-block" onClick={onAdd}>
          Add to Cart
        </button>
      </div>
    </article>
  );
}