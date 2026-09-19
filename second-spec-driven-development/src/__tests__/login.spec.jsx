import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppContent } from '../App.jsx';
import { DEMO_USER } from '../test/fixtures.js';
import { apiOverrides, DEMO_CREDENTIALS } from '../api.js';

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppContent />
    </MemoryRouter>,
  );
}

function seedSession() {
  localStorage.setItem(
    'session',
    JSON.stringify({ id: DEMO_USER.id, name: DEMO_USER.name, email: DEMO_USER.email }),
  );
}

async function loginForm(user) {
  const heading = await screen.findByRole('heading', { name: 'Login' });
  expect(heading).toBeInTheDocument();
  if (user) {
    await user.type(screen.getByLabelText('Email'), DEMO_CREDENTIALS.email);
    return screen.getByLabelText('Password');
  }
  return null;
}

describe('login spec', () => {
  it('renders the login form with email, password and login button', async () => {
    renderAt('/login');

    expect(await screen.findByRole('heading', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('rejects an empty submission with validation messages', async () => {
    const user = userEvent.setup();
    renderAt('/login');
    await loginForm();

    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText('Email is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
  });

  it('rejects an invalid email format', async () => {
    const user = userEvent.setup();
    renderAt('/login');
    await loginForm();

    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.type(screen.getByLabelText('Password'), DEMO_CREDENTIALS.password);
    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText('Enter a valid email address.')).toBeInTheDocument();
  });

  it('logs in with valid credentials and routes to /dashboard', async () => {
    const user = userEvent.setup();
    renderAt('/login');
    await loginForm(user);

    await user.type(screen.getByLabelText('Password'), DEMO_CREDENTIALS.password);
    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('Welcome back!')).toBeInTheDocument();
  });

  it('shows an error and stays on /login for invalid credentials', async () => {
    const user = userEvent.setup();
    renderAt('/login');
    await loginForm(user);

    await user.type(screen.getByLabelText('Password'), 'wrong-password');
    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText('Invalid email or password.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
  });

  it('shows a server-error message when the service fails', async () => {
    const user = userEvent.setup();
    renderAt('/login');
    apiOverrides.failLogin = true;
    await loginForm(user);

    await user.type(screen.getByLabelText('Password'), DEMO_CREDENTIALS.password);
    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(
      await screen.findByText('Unable to log in right now. Please try again.'),
    ).toBeInTheDocument();
  });

  it('redirects unauthenticated users away from /dashboard to /login', async () => {
    renderAt('/dashboard');

    expect(await screen.findByRole('heading', { name: 'Login' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Dashboard' })).not.toBeInTheDocument();
  });

  it('redirects an authenticated user visiting /login to /dashboard', async () => {
    seedSession();
    renderAt('/login');

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('logout clears the session and protects /dashboard again', async () => {
    const user = userEvent.setup();
    seedSession();
    renderAt('/dashboard');

    await user.click(await screen.findByRole('button', { name: 'Logout' }));

    expect(await screen.findByRole('heading', { name: 'Login' })).toBeInTheDocument();
    expect(localStorage.getItem('session')).toBeNull();
  });
});