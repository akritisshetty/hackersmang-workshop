import { useEffect, useRef, useState } from 'react';
import * as api from '../api.js';
import Navbar from '../components/Navbar.jsx';
import ItemCard from '../components/ItemCard.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const { addItem } = useCart();
  const feedbackTimer = useRef(null);

  function loadItems() {
    setLoading(true);
    setError('');
    api
      .getItems()
      .then(setItems)
      .catch(() => setError('Unable to load items. Please try again.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function handleAdd(item) {
    await addItem(item);
    setFeedback('Item added to cart.');
    clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setFeedback(''), 2500);
  }

  return (
    <div className="app-shell">
      <Navbar />
      <main className="container">
        <h1>Dashboard</h1>
        <p className="welcome">Welcome back!</p>

        {feedback && (
          <p role="status" className="notice">
            {feedback}
          </p>
        )}

        {loading && <p className="page-status">Loading items...</p>}

        {error && (
          <div className="error-box">
            <p role="alert">{error}</p>
            <button type="button" className="btn btn-secondary" onClick={loadItems}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <p className="page-status">No items available.</p>
        )}

        {!loading && !error && items.length > 0 && (
          <section className="items-grid" aria-label="Items">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} onAdd={() => handleAdd(item)} />
            ))}
          </section>
        )}
      </main>
    </div>
  );
}