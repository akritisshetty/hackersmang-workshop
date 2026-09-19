import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppContent } from '../App.jsx';
import { DEMO_USER, SEEDED_CART } from '../test/fixtures.js';

function seedSession() {
  localStorage.setItem(
    'session',
    JSON.stringify({ id: DEMO_USER.id, name: DEMO_USER.name, email: DEMO_USER.email }),
  );
}

function renderAt(path, { cart } = {}) {
  seedSession();
  if (cart) localStorage.setItem('cart', JSON.stringify(cart));
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppContent />
    </MemoryRouter>,
  );
}

async function awaitCartLoaded() {
  return screen.findByRole('heading', { name: 'Wireless Headphones' });
}

describe('cart spec', () => {
  it('is only accessible to authenticated users', async () => {
    render(
      <MemoryRouter initialEntries={['/cart']}>
        <AppContent />
      </MemoryRouter>,
    );
    expect(await screen.findByRole('heading', { name: 'Login' })).toBeInTheDocument();
  });

  it('displays all products with name, price, quantity, subtotal and total', async () => {
    renderAt('/cart', { cart: SEEDED_CART });

    expect(await screen.findByRole('heading', { name: 'Cart' })).toBeInTheDocument();
    await awaitCartLoaded();

    expect(screen.getByRole('heading', { name: 'Mechanical Keyboard' })).toBeInTheDocument();
    expect(screen.getByText('₹1,999')).toBeInTheDocument();
    expect(screen.getByText('₹2,999')).toBeInTheDocument();

    expect(screen.getByText('Subtotal: ₹3,998')).toBeInTheDocument();
    expect(screen.getByText('Subtotal: ₹2,999')).toBeInTheDocument();
    expect(screen.getByText('Total: ₹6,997')).toBeInTheDocument();
  });

  it('increases quantity with + and updates subtotal and total immediately', async () => {
    const user = userEvent.setup();
    renderAt('/cart', { cart: SEEDED_CART });

    await user.click(
      await screen.findByRole('button', { name: 'Increase quantity of Wireless Headphones' }),
    );

    expect(await screen.findByText('Subtotal: ₹5,997')).toBeInTheDocument();
    expect(screen.getByText('Total: ₹8,996')).toBeInTheDocument();
  });

  it('decreases quantity with - and removes the item when it reaches zero', async () => {
    const user = userEvent.setup();
    renderAt('/cart', { cart: SEEDED_CART });

    await user.click(
      await screen.findByRole('button', { name: 'Decrease quantity of Mechanical Keyboard' }),
    );

    expect(
      screen.queryByRole('heading', { name: 'Mechanical Keyboard' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Total: ₹3,998')).toBeInTheDocument();
  });

  it('removes a product completely with Remove', async () => {
    const user = userEvent.setup();
    renderAt('/cart', { cart: SEEDED_CART });
    await awaitCartLoaded();

    const removeButtons = await screen.findAllByRole('button', { name: 'Remove' });
    await user.click(removeButtons[0]);

    expect(
      screen.queryByRole('heading', { name: 'Wireless Headphones' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Mechanical Keyboard' })).toBeInTheDocument();
  });

  it('shows the empty-cart state and hides checkout when the cart is empty', async () => {
    renderAt('/cart', { cart: [] });

    expect(await screen.findByText('Your cart is empty.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Continue Shopping' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Proceed to Checkout' })).not.toBeInTheDocument();
  });

  it('enables Proceed to Checkout when the cart has items', async () => {
    renderAt('/cart', { cart: SEEDED_CART });

    const checkout = await screen.findByRole('button', { name: 'Proceed to Checkout' });
    expect(checkout).toBeInTheDocument();
    expect(checkout).not.toBeDisabled();
  });

  it('Continue Shopping returns to /dashboard without losing the cart', async () => {
    const user = userEvent.setup();
    renderAt('/cart', { cart: SEEDED_CART });
    await awaitCartLoaded();

    await user.click(await screen.findByRole('link', { name: 'Continue Shopping' }));

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Cart (3)' })).toBeInTheDocument();
  });

  it('keeps the same cart state when navigating between dashboard and cart', async () => {
    const user = userEvent.setup();
    renderAt('/dashboard', { cart: SEEDED_CART });

    await user.click(await screen.findByRole('link', { name: 'Cart (3)' }));

    expect(await screen.findByRole('heading', { name: 'Cart' })).toBeInTheDocument();
    await awaitCartLoaded();
    expect(screen.getByText('Total: ₹6,997')).toBeInTheDocument();
  });

  it('restores the cart from localStorage when the app loads', async () => {
    renderAt('/cart', { cart: SEEDED_CART });

    expect(await awaitCartLoaded()).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Cart (3)' })).toBeInTheDocument();
  });

  it('shows a loading state while the cart loads', async () => {
    renderAt('/cart', { cart: [] });

    expect(await screen.findByText('Loading cart...')).toBeInTheDocument();
    expect(await screen.findByText('Your cart is empty.')).toBeInTheDocument();
  });

  it('shows an error with a Retry action when the cart fails to load', async () => {
    const { apiOverrides } = await import('../api.js');
    seedSession();
    apiOverrides.failCart = true;

    render(
      <MemoryRouter initialEntries={['/cart']}>
        <AppContent />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText('Unable to load your cart. Please try again.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });
});