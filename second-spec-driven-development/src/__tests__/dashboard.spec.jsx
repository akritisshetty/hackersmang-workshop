import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppContent } from '../App.jsx';
import { DEMO_USER } from '../test/fixtures.js';
import { apiOverrides } from '../api.js';

function renderDashboard(applyOverrides) {
  localStorage.setItem(
    'session',
    JSON.stringify({ id: DEMO_USER.id, name: DEMO_USER.name, email: DEMO_USER.email }),
  );
  if (applyOverrides) applyOverrides();
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <AppContent />
    </MemoryRouter>,
  );
}

async function itemCards() {
  return screen.findAllByRole('button', { name: 'Add to Cart' });
}

describe('dashboard spec', () => {
  it('is only accessible to authenticated users', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AppContent />
      </MemoryRouter>,
    );
    expect(await screen.findByRole('heading', { name: 'Login' })).toBeInTheDocument();
  });

  it('renders items with name, description, price and an Add to Cart button', async () => {
    renderDashboard();

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();

    expect(await screen.findByRole('heading', { name: 'Wireless Headphones' })).toBeInTheDocument();
    expect(screen.getByText('Bluetooth wireless headphones')).toBeInTheDocument();
    expect(screen.getByText('₹1,999')).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'Mechanical Keyboard' })).toBeInTheDocument();
    expect(screen.getByText('₹2,999')).toBeInTheDocument();

    expect((await itemCards()).length).toBe(5);
  });

  it('adds an item, updates the cart indicator and shows feedback', async () => {
    const user = userEvent.setup();
    renderDashboard();

    const addButtons = await itemCards();
    await user.click(addButtons[0]);

    expect(await screen.findByText('Item added to cart.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Cart (1)' })).toBeInTheDocument();
  });

  it('adds the same item again by increasing quantity instead of duplicating', async () => {
    const user = userEvent.setup();
    renderDashboard();

    const addButtons = await itemCards();
    await user.click(addButtons[0]);
    await user.click(addButtons[0]);

    expect(await screen.findByRole('link', { name: 'Cart (2)' })).toBeInTheDocument();
  });

  it('shows the aggregate quantity in the cart indicator', async () => {
    const user = userEvent.setup();
    renderDashboard();

    const addButtons = await itemCards();
    await user.click(addButtons[0]);
    await user.click(addButtons[1]);
    await user.click(addButtons[1]);

    expect(await screen.findByRole('link', { name: 'Cart (3)' })).toBeInTheDocument();
  });

  it('shows an error message with a Retry action when items fail to load', async () => {
    const user = userEvent.setup();
    renderDashboard(() => {
      apiOverrides.failItems = true;
    });

    expect(await screen.findByText('Unable to load items. Please try again.')).toBeInTheDocument();
    const retry = screen.getByRole('button', { name: 'Retry' });
    await user.click(retry);
    expect(await screen.findByText('Unable to load items. Please try again.')).toBeInTheDocument();
  });

  it('shows an empty state when there are no items', async () => {
    renderDashboard(() => {
      apiOverrides.catalog = [];
    });

    expect(await screen.findByText('No items available.')).toBeInTheDocument();
  });
});