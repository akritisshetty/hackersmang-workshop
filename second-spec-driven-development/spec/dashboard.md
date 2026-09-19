# Dashboard Specification

## 1. Overview

Build a dashboard page that displays a list of items and allows authenticated users to add items to a shopping cart.

The dashboard should be accessible only to logged-in users.

## 2. Functional Requirements

### 2.1 Dashboard Page

The dashboard must contain:

- Page heading: `Dashboard`
- List/grid of available items
- Item details
- `Add to Cart` button for each item
- Cart indicator showing the number of items in the cart
- Cart section or cart page
- Logout button

Suggested layout:

```text
+------------------------------------------------+
| Dashboard                         Cart (2)     |
+------------------------------------------------+
|                                                |
| Items                                          |
|                                                |
| +------------+  +------------+  +------------+ |
| | Item 1     |  | Item 2     |  | Item 3     | |
| | ₹499       |  | ₹799       |  | ₹299       | |
| | [Add Cart] |  | [Add Cart] |  | [Add Cart] | |
| +------------+  +------------+  +------------+ |
|                                                |
+------------------------------------------------+
```

## 3. Item List

Each item should display:

- Item name
- Item image
- Short description
- Price
- `Add to Cart` button

Example item:

```json
{
  "id": 1,
  "name": "Wireless Headphones",
  "description": "Bluetooth wireless headphones",
  "price": 1999,
  "image": "/images/headphones.jpg"
}
```

## 4. Item Data

The application should support loading items from an API or a local data source.

Example endpoint:

```text
GET /api/items
```

Example response:

```json
[
  {
    "id": 1,
    "name": "Wireless Headphones",
    "description": "Bluetooth wireless headphones",
    "price": 1999,
    "image": "/images/headphones.jpg"
  },
  {
    "id": 2,
    "name": "Mechanical Keyboard",
    "description": "RGB mechanical keyboard",
    "price": 2999,
    "image": "/images/keyboard.jpg"
  }
]
```

## 5. Add to Cart

When the user clicks `Add to Cart`:

1. Identify the selected item.
2. Add the item to the cart.
3. If the item already exists in the cart, increase its quantity instead of creating a duplicate cart entry.
4. Update the cart item count.
5. Provide visual feedback that the item was added.

Example:

```text
Item added to cart.
```

## 6. Cart

The cart should contain:

- Item name
- Item price
- Quantity
- Subtotal
- Remove button
- Increase quantity button
- Decrease quantity button
- Total price

Example:

```text
+--------------------------------------------+
| Cart                                       |
+--------------------------------------------+
| Wireless Headphones                        |
| ₹1999 × 2                  ₹3998           |
| [-] 2 [+]                     [Remove]     |
|                                            |
| Mechanical Keyboard                        |
| ₹2999 × 1                  ₹2999           |
| [-] 1 [+]                     [Remove]     |
|                                            |
| Total:                       ₹6997          |
|                                            |
|             [Proceed to Checkout]          |
+--------------------------------------------+
```

## 7. Cart Operations

### Increase Quantity

Clicking `+` should increase the selected item's quantity by 1.

### Decrease Quantity

Clicking `-` should decrease the quantity by 1.

If the quantity reaches 0, the item should be removed from the cart.

### Remove Item

Clicking `Remove` should remove the selected item completely from the cart.

### Cart Total

Calculate:

```text
Item subtotal = item price × quantity
Cart total = sum of all item subtotals
```

The total should update immediately whenever the cart changes.

## 8. Cart Persistence

The cart should remain available when the user navigates between dashboard and cart.

For the initial implementation, the cart may be stored in:

- Application state, or
- `localStorage`

If `localStorage` is used, restore the cart when the dashboard is loaded.

Example:

```text
localStorage key:
cart
```

For a production application, cart persistence should preferably be handled by the backend for authenticated users.

## 9. Cart Indicator

Display the total quantity of items in the cart.

Example:

```text
Cart (3)
```

If the cart is empty:

```text
Cart (0)
```

The indicator should update immediately after adding, removing, or changing quantities.

## 10. Empty States

### No Items

If there are no available items, display:

```text
No items available.
```

### Empty Cart

If the cart contains no items, display:

```text
Your cart is empty.

[Continue Shopping]
```

## 11. Loading and Error States

### Loading Items

While items are being fetched:

```text
Loading items...
```

### Failed Item Request

If items cannot be loaded:

```text
Unable to load items. Please try again.
```

Provide a `Retry` action.

## 12. Authentication and Routing

The dashboard must be protected.

### Unauthenticated User

If the user is not authenticated:

```text
/dashboard → /login
```

The user should not be able to access the dashboard without logging in.

### Authenticated User

After successful login:

```text
/login → /dashboard
```

The authenticated user can view items and manage their cart.

## 13. Logout

The dashboard should include a `Logout` button.

When clicked:

1. Clear the authentication session/token.
2. Redirect the user to `/login`.
3. Prevent access to `/dashboard` until the user logs in again.

Cart behavior after logout should be explicitly defined by the implementation:

- If cart data is user-specific, preserve it on the backend.
- If using local-only cart storage, clear it on logout if required by the application's security/privacy requirements.

## 14. UI Requirements

- Use a clean and responsive layout.
- Display items in a card-based grid on larger screens.
- Stack item cards appropriately on smaller screens.
- Make buttons clearly visible and accessible.
- Provide hover and focus states.
- Use semantic HTML.
- Provide accessible labels for buttons.
- Ensure sufficient contrast between text and background.
- The dashboard should be usable with keyboard navigation.

## 15. Suggested Routes

```text
/login
/dashboard
/cart
```

The cart may alternatively be displayed as a drawer/modal from the dashboard.

## 16. Suggested API Endpoints

```text
GET    /api/items
GET    /api/cart
POST   /api/cart/items
PATCH  /api/cart/items/:itemId
DELETE /api/cart/items/:itemId
DELETE /api/cart
```

The exact API implementation can vary depending on the backend architecture.

## 17. Data Model

### Item

```json
{
  "id": 1,
  "name": "Wireless Headphones",
  "description": "Bluetooth wireless headphones",
  "price": 1999,
  "image": "/images/headphones.jpg"
}
```

### Cart Item

```json
{
  "itemId": 1,
  "name": "Wireless Headphones",
  "price": 1999,
  "quantity": 2
}
```

## 18. Acceptance Criteria

### Dashboard

- [ ] Authenticated users can access `/dashboard`.
- [ ] Unauthenticated users are redirected to `/login`.
- [ ] Items are displayed correctly.
- [ ] Each item displays its name, description, image, and price.
- [ ] Each item has an `Add to Cart` button.

### Add to Cart

- [ ] Clicking `Add to Cart` adds the selected item.
- [ ] Adding the same item again increases its quantity.
- [ ] Cart count updates immediately.
- [ ] User receives visual feedback after adding an item.

### Cart

- [ ] Cart displays all selected items.
- [ ] Quantity can be increased.
- [ ] Quantity can be decreased.
- [ ] Items can be removed.
- [ ] Item subtotals are calculated correctly.
- [ ] Cart total is calculated correctly.
- [ ] Cart updates immediately after changes.
- [ ] Empty cart state is displayed when appropriate.

### Persistence

- [ ] Cart remains available while navigating between dashboard and cart.
- [ ] If localStorage is used, cart state is restored after page refresh.

### Logout

- [ ] Logout clears authentication.
- [ ] User is redirected to `/login`.
- [ ] Dashboard cannot be accessed without authentication.

## 19. Out of Scope

The following features are not required for the initial dashboard implementation:

- Product search
- Product filtering
- Product sorting
- Product reviews
- Wishlist
- Payment processing
- Order history
- Checkout/payment gateway
- Coupons and discounts
- Inventory management
- Admin dashboard
