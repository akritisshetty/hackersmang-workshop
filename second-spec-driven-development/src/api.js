export const DEMO_CREDENTIALS = {
  email: 'user@example.com',
  password: 'password123',
};

export const CATALOG = [
  {
    id: 1,
    name: 'Wireless Headphones',
    description: 'Bluetooth wireless headphones',
    price: 1999,
    image: '/images/headphones.svg',
  },
  {
    id: 2,
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical keyboard',
    price: 2999,
    image: '/images/keyboard.svg',
  },
  {
    id: 3,
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse',
    price: 799,
    image: '/images/mouse.svg',
  },
  {
    id: 4,
    name: 'USB-C Hub',
    description: '7-in-1 USB-C hub with HDMI',
    price: 1299,
    image: '/images/hub.svg',
  },
  {
    id: 5,
    name: 'Laptop Stand',
    description: 'Foldable aluminium laptop stand',
    price: 1499,
    image: '/images/stand.svg',
  },
];

export const SESSION_KEY = 'session';
export const CART_KEY = 'cart';

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function httpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export const apiOverrides = {
  failLogin: false,
  failItems: false,
  failCart: false,
  catalog: null,
};

export async function login({ email, password }) {
  await delay();
  if (apiOverrides.failLogin) throw httpError('Server error', 500);
  if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
    const user = { id: 1, name: 'Workshop User', email };
    write(SESSION_KEY, user);
    return { user };
  }
  throw httpError('Invalid email or password.', 401);
}

export async function logout() {
  await delay(120);
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(CART_KEY);
  return {};
}

export async function getMe() {
  await delay(120);
  const user = read(SESSION_KEY, null);
  if (!user) throw httpError('Unauthorized', 401);
  return { user };
}

export async function getItems() {
  await delay();
  if (apiOverrides.failItems) throw httpError('Unable to load items.', 500);
  return apiOverrides.catalog ?? CATALOG;
}

export async function getCart() {
  await delay(120);
  if (apiOverrides.failCart) throw httpError('Unable to load your cart.', 500);
  return read(CART_KEY, []);
}

export async function addToCart(itemId) {
  const cart = read(CART_KEY, []);
  const item = CATALOG.find((i) => i.id === Number(itemId));
  if (!item) throw httpError('Item not found.', 404);
  const existing = cart.find((i) => i.itemId === item.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      itemId: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
      quantity: 1,
    });
  }
  write(CART_KEY, cart);
  return { cart, message: 'Item added to cart.' };
}

export async function updateCartItem(itemId, quantity) {
  const cart = read(CART_KEY, []);
  const index = cart.findIndex((i) => i.itemId === Number(itemId));
  if (index === -1) throw httpError('Item not in cart.', 404);
  if (quantity <= 0) {
    cart.splice(index, 1);
  } else {
    cart[index].quantity = quantity;
  }
  write(CART_KEY, cart);
  return { cart };
}

export async function removeCartItem(itemId) {
  const cart = read(CART_KEY, []);
  const index = cart.findIndex((i) => i.itemId === Number(itemId));
  if (index === -1) throw httpError('Item not in cart.', 404);
  cart.splice(index, 1);
  write(CART_KEY, cart);
  return { cart };
}

export async function clearCart() {
  write(CART_KEY, []);
  return { cart: [] };
}