# Spec-Driven Shop

A spec-driven e-commerce webapp built from markdown specifications in
[`spec/`](./spec) (`login.md`, `dashboard.md`, `cart.md`) as a **frontend-only
React (Vite)** application.

The API layer in `src/api.js` is a client-side mock of the backend: it stores
the session and cart in `localStorage` so the app remains fully functional and
spec-compliant without a server.

## Quick start

```bash
./run.sh          # install deps, run all spec files, build the app
./run.sh dev      # start the dev server on http://localhost:5173
./run.sh test     # run only the spec files
./run.sh start    # serve the production build on http://localhost:4173
```

Or manually:

```bash
npm install
npm test      # runs every spec file
npm run dev
```

## Demo credentials

```
email:    user@example.com
password: password123
```

## Spec coverage

| Spec file          | Spec test                               |
| ------------------ | --------------------------------------- |
| `spec/login.md`    | `src/__tests__/login.spec.jsx`     |
| `spec/dashboard.md` | `src/__tests__/dashboard.spec.jsx` |
| `spec/cart.md`     | `src/__tests__/cart.spec.jsx`      |

## Routing

```
/login      → Login page (redirects to /dashboard if authenticated)
/dashboard  → Protected. Item grid + Add to Cart + cart indicator + Logout
/cart       → Protected. Cart management (quantities, remove, totals)
```

The cart is persisted to `localStorage` under the `cart` key so it survives
refreshes and stays in sync while navigating between `/dashboard` and `/cart`.
The session is persisted under `session` and logged out via the `Logout`
button.