import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { useCart } from '../context/CartContext.jsx';
import { formatINR } from '../utils/format.js';

export default function CartPage() {
  const { cart, total, loading, error, reload, updateQuantity, removeItem } = useCart();

  function decrease(item) {
    if (item.quantity - 1 < 1) {
      removeItem(item.itemId);
    } else {
      updateQuantity(item.itemId, item.quantity - 1);
    }
  }

  return (
    <div className="app-shell">
      <Navbar />
      <main className="container">
        <h1>Cart</h1>

        {loading && <p className="page-status">Loading cart...</p>}

        {error && (
          <div className="error-box">
            <p role="alert">{error}</p>
            <button type="button" className="btn btn-secondary" onClick={reload}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && cart.length === 0 && (
          <div className="empty-state">
            <p>Your cart is empty.</p>
            <Link className="btn btn-secondary" to="/dashboard">
              Continue Shopping
            </Link>
          </div>
        )}

        {!loading && !error && cart.length > 0 && (
          <>
            <section className="cart-list" aria-label="Cart items">
              {cart.map((item) => (
                <article key={item.itemId} className="cart-item">
                  <img
                    className="cart-item-image"
                    src={item.image}
                    alt={item.name}
                    width={96}
                    height={96}
                  />
                  <div className="cart-item-info">
                    <h2>{item.name}</h2>
                    <p className="item-description">{item.description}</p>
                    <p className="item-price">{formatINR(item.price)}</p>
                    <div className="cart-item-controls">
                      <div className="qty-controls">
                        <button
                          type="button"
                          className="btn btn-ghost qty-btn"
                          aria-label={`Decrease quantity of ${item.name}`}
                          onClick={() => decrease(item)}
                        >
                          −
                        </button>
                        <span className="qty-value">{item.quantity}</span>
                        <button
                          type="button"
                          className="btn btn-ghost qty-btn"
                          aria-label={`Increase quantity of ${item.name}`}
                          onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => removeItem(item.itemId)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="subtotal">Subtotal: {formatINR(item.price * item.quantity)}</p>
                </article>
              ))}
            </section>

            <div className="cart-summary">
              <p className="total-row">Total: {formatINR(total)}</p>
              <div className="cart-actions">
                <Link className="btn btn-secondary" to="/dashboard">
                  Continue Shopping
                </Link>
                <button type="button" className="btn btn-primary" disabled={cart.length === 0}>
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}