# Cart Page Specification

## 1. Overview

Build a cart page that displays the products added by the authenticated
user and allows the user to view and edit the cart.

The cart should work with the dashboard flow, where users add available
items using the `Add to Cart` button. The dashboard already defines the
cart indicator, cart contents, quantity controls, remove action, total
calculation, persistence, and suggested cart API endpoints.
fileciteturn0file0L94-L121

## 2. Functional Requirements

### 2.1 Cart Page

The cart page must contain:

-   Page heading: `Cart`
-   List of products currently added to the cart
-   Product image
-   Product name
-   Product description
-   Product price
-   Quantity controls
-   Item subtotal
-   `Remove` button
-   Total price
-   `Continue Shopping` button
-   `Proceed to Checkout` button

Suggested layout:

``` text
+------------------------------------------------------+
| Cart                                                 |
+------------------------------------------------------+
|                                                      |
| +----------+  Wireless Headphones                    |
| |  Image   |  Bluetooth wireless headphones         |
| |          |  ₹1999                                  |
| +----------+  [-] 2 [+]       Subtotal: ₹3998       |
|                              [Edit] [Remove]         |
|                                                      |
| +----------+  Mechanical Keyboard                   |
| |  Image   |  RGB mechanical keyboard               |
| |          |  ₹2999                                  |
| +----------+  [-] 1 [+]       Subtotal: ₹2999       |
|                              [Edit] [Remove]         |
|                                                      |
|                         Total: ₹6997                 |
|                                                      |
|       [Continue Shopping]   [Proceed to Checkout]    |
+------------------------------------------------------+
```

## 3. Cart Item Display

Each cart item should display:

-   Item name
-   Item image
-   Short description
-   Unit price
-   Current quantity
-   Item subtotal
-   `+` quantity button
-   `-` quantity button
-   `Remove` button

Example:

``` text
+------------------------------------------------+
| Wireless Headphones                            |
| Bluetooth wireless headphones                  |
|                                                |
| ₹1999                                           |
|                                                |
| Quantity:  [-]  2  [+]                        |
| Subtotal: ₹3998                 [Remove]       |
+------------------------------------------------+
```

## 4. View Cart Data

The cart should use the item information already defined by the
dashboard.

Example item:

``` json
{
  "id": 1,
  "name": "Wireless Headphones",
  "description": "Bluetooth wireless headphones",
  "price": 1999,
  "image": "/images/headphones.jpg"
}
```

A cart item should contain:

``` json
{
  "itemId": 1,
  "name": "Wireless Headphones",
  "price": 1999,
  "quantity": 2,
  "image": "/images/headphones.jpg"
}
```

## 5. Edit Cart Items

The user must be able to edit products already added to the cart.

### 5.1 Increase Quantity

Clicking `+` should increase the selected product quantity by 1.

``` text
[-] 2 [+]
       ↓
[-] 3 [+]
```

The item subtotal and cart total must update immediately.

### 5.2 Decrease Quantity

Clicking `-` should decrease the selected product quantity by 1.

``` text
[-] 2 [+]
       ↓
[-] 1 [+]
```

If the quantity reaches `0`, the item should be removed from the cart.

### 5.3 Remove Product

Clicking `Remove` should completely remove the selected product from the
cart.

Example:

``` text
[Remove]
```

After removal:

1.  Remove the item from the cart.
2.  Update the cart item count.
3.  Recalculate the cart total.
4.  Update the cart indicator.
5.  Display the empty-cart state if no products remain.

### 5.4 Edit Quantity Directly

If a direct quantity input is provided, it should:

-   Accept only positive integers.
-   Reject invalid values.
-   Update the cart when changed.
-   Prevent quantities below `1`.
-   Respect available stock if stock limits are implemented.

Example:

``` text
Quantity: [ 2 ]
```

## 6. Cart Calculations

Calculate each item subtotal as:

``` text
Item subtotal = item price × quantity
```

Calculate the cart total as:

``` text
Cart total = sum of all item subtotals
```

Example:

``` text
Wireless Headphones
₹1999 × 2 = ₹3998

Mechanical Keyboard
₹2999 × 1 = ₹2999

--------------------------------
Total = ₹6997
```

The total must update immediately whenever an item is added, removed, or
its quantity changes. This follows the calculation behavior defined in
the dashboard specification. fileciteturn0file0L143-L168

## 7. Cart Indicator

The dashboard cart indicator must remain synchronized with the cart
page.

Example:

``` text
Cart (3)
```

The number represents the total quantity of products in the cart.

The indicator must update immediately after:

-   Increasing quantity
-   Decreasing quantity
-   Removing an item
-   Adding another item from the dashboard

The dashboard specification defines this indicator as the total quantity
of items in the cart. fileciteturn0file0L190-L206

## 8. Cart Persistence

Cart contents must remain available when the user navigates between:

``` text
/dashboard
/cart
```

For the initial implementation, the cart may use:

-   Application state, or
-   `localStorage`

If `localStorage` is used, use:

``` text
localStorage key:
cart
```

The cart should be restored when the application is loaded.

For an authenticated production application, backend persistence is
preferred. The dashboard specification also defines `GET /api/cart`,
`POST /api/cart/items`, `PATCH /api/cart/items/:itemId`,
`DELETE /api/cart/items/:itemId`, and `DELETE /api/cart` as suggested
cart endpoints. fileciteturn0file0L170-L188
fileciteturn0file0L309-L320

## 9. Empty Cart

If there are no products:

``` text
+------------------------------------------------+
| Cart                                           |
+------------------------------------------------+
|                                                |
|              Your cart is empty.               |
|                                                |
|          [Continue Shopping]                  |
|                                                |
+------------------------------------------------+
```

The `Proceed to Checkout` button should not be available when the cart
is empty.

The dashboard specification defines the empty-cart message as
`Your cart is empty.` with a `Continue Shopping` action.
fileciteturn0file0L218-L225

## 10. Continue Shopping

Clicking:

``` text
[Continue Shopping]
```

should navigate the user to:

``` text
/dashboard
```

The user should be able to continue adding products without losing the
existing cart contents.

## 11. Checkout

Display:

``` text
[Proceed to Checkout]
```

The button should only be enabled when the cart contains at least one
product.

For the initial implementation, checkout/payment processing is outside
the scope of this cart page. The dashboard specification lists
checkout/payment gateway and payment processing as out of scope for the
initial implementation. fileciteturn0file0L386-L400

When checkout functionality is implemented later, the cart should be
validated before proceeding.

## 12. Authentication

The cart page should be accessible only to authenticated users.

If an unauthenticated user attempts to access:

``` text
/cart
```

redirect them to:

``` text
/login
```

The login and dashboard specifications establish the application
authentication flow and protected dashboard behavior.
fileciteturn0file1L83-L93

## 13. Logout

The existing dashboard `Logout` behavior should remain unchanged.

When the user logs out:

1.  Clear the authentication session/token.
2.  Redirect to `/login`.
3.  Prevent access to `/dashboard` and `/cart` until authentication
    succeeds again.

Cart behavior after logout should follow the application's chosen
persistence model. For a user-specific backend cart, preserve the cart
on the backend; for local-only storage, clear it if required by the
application's security/privacy requirements.
fileciteturn0file0L272-L285

## 14. Loading State

While the cart is being loaded:

``` text
Loading cart...
```

The UI should prevent conflicting cart operations until the initial cart
state is available.

If individual cart updates are asynchronous, show an appropriate loading
state for the affected item without unnecessarily blocking unrelated
cart interactions.

## 15. Error States

### Cart Load Failure

Display:

``` text
Unable to load your cart. Please try again.
```

Provide:

``` text
[Retry]
```

### Update Failure

If changing quantity fails:

``` text
Unable to update the cart. Please try again.
```

Restore the affected item to its previous valid state.

### Remove Failure

If removing an item fails:

``` text
Unable to remove this item. Please try again.
```

Do not remove the item visually until the operation succeeds, unless the
implementation uses an optimistic update with rollback.

## 16. Data Synchronization

The cart page and dashboard must use the same cart state.

Changes made on `/cart` must be reflected on `/dashboard`.

Changes made on `/dashboard` must be reflected on `/cart`.

The following values must remain synchronized:

-   Cart item list
-   Item quantities
-   Cart item count
-   Item subtotals
-   Cart total

## 17. Suggested Route

``` text
/login
/dashboard
/cart
```

The cart can be implemented as a dedicated `/cart` page. The dashboard
specification also allows the cart to alternatively appear as a
drawer/modal from the dashboard. fileciteturn0file0L299-L307

## 18. Suggested API Endpoints

``` text
GET    /api/cart
POST   /api/cart/items
PATCH  /api/cart/items/:itemId
DELETE /api/cart/items/:itemId
DELETE /api/cart
```

### Get Cart

``` text
GET /api/cart
```

Returns the current user's cart.

### Add Item

``` text
POST /api/cart/items
```

Adds a product to the cart.

If the product already exists, increase its quantity rather than
creating a duplicate entry.

### Update Item

``` text
PATCH /api/cart/items/:itemId
```

Updates the selected cart item's quantity.

Example request:

``` json
{
  "quantity": 3
}
```

### Remove Item

``` text
DELETE /api/cart/items/:itemId
```

Removes the selected product.

### Clear Cart

``` text
DELETE /api/cart
```

Removes all products from the current cart.

## 19. UI Requirements

-   Use a clean and responsive layout.
-   Display cart items clearly.
-   Make quantity controls easy to identify.
-   Make `Remove` actions clearly visible.
-   Display prices consistently.
-   Keep the cart total visually prominent.
-   Provide hover and focus states.
-   Use semantic HTML.
-   Provide accessible labels for icon-only quantity buttons.
-   Ensure sufficient contrast.
-   Support keyboard navigation.
-   Ensure the layout works on desktop, tablet, and mobile.

Suggested mobile layout:

``` text
+--------------------------------+
| Cart                           |
+--------------------------------+
| Wireless Headphones            |
| Bluetooth wireless headphones  |
| ₹1999                          |
|                                |
| Quantity                       |
| [-] 2 [+]                      |
|                                |
| Subtotal: ₹3998                |
| [Remove]                       |
+--------------------------------+
| Mechanical Keyboard            |
| RGB mechanical keyboard        |
| ₹2999                          |
|                                |
| Quantity                       |
| [-] 1 [+]                      |
|                                |
| Subtotal: ₹2999                |
| [Remove]                       |
+--------------------------------+
| Total: ₹6997                   |
|                                |
| [Continue Shopping]            |
| [Proceed to Checkout]          |
+--------------------------------+
```

## 20. Acceptance Criteria

### Cart Display

-   [ ] Authenticated users can access `/cart`.
-   [ ] Unauthenticated users are redirected to `/login`.
-   [ ] All products currently in the cart are displayed.
-   [ ] Each product displays its name, image, description, and price.
-   [ ] Each product displays its current quantity.
-   [ ] Each product displays its subtotal.
-   [ ] The cart displays the total price.

### Edit Cart

-   [ ] User can increase product quantity.
-   [ ] User can decrease product quantity.
-   [ ] Quantity cannot become invalid.
-   [ ] Quantity reaching `0` removes the item.
-   [ ] User can remove a product completely.
-   [ ] User can directly edit quantity if a quantity input is
    implemented.
-   [ ] Item subtotals update immediately.
-   [ ] Cart total updates immediately.

### Synchronization

-   [ ] Cart changes are reflected in the dashboard cart indicator.
-   [ ] Dashboard and cart use the same cart state.
-   [ ] Cart contents remain available while navigating between
    dashboard and cart.

### Empty Cart

-   [ ] Empty cart state is displayed when no products exist.
-   [ ] `Continue Shopping` returns the user to `/dashboard`.
-   [ ] Checkout is unavailable when the cart is empty.

### Persistence

-   [ ] Cart state persists according to the selected storage strategy.
-   [ ] If `localStorage` is used, the cart is restored after refresh.

### Error Handling

-   [ ] Cart loading errors are displayed clearly.
-   [ ] Cart update errors are handled.
-   [ ] Cart removal errors are handled.
-   [ ] Failed operations do not leave the cart in an inconsistent
    state.

## 21. Out of Scope

The following features are not required for the initial cart
implementation:

-   Product search
-   Product filtering
-   Product sorting
-   Product reviews
-   Wishlist
-   Payment processing
-   Payment gateway integration
-   Order history
-   Coupons and discounts
-   Inventory management
-   Admin dashboard
-   User registration
-   Forgot password
-   Social login
-   Multi-factor authentication
