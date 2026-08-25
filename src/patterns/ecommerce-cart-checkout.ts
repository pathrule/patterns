import type { Pattern } from "../types.js";

export const ecommerceCartCheckout: Pattern = {
  "slug": "ecommerce-cart-checkout",
  "version": "1.0.0",
  "name": "E-commerce Cart and Checkout",
  "tagline": "Keep catalog, cart, price, inventory, order, payment, and fulfillment state consistent.",
  "description": "Checkout coordinates several authorities that change independently: products and promotions, taxes and shipping, inventory, customer identity, payment state, order state, and fulfillment systems. This pattern constrains server-side pricing, inventory reservation, idempotent order creation, and payment-order reconciliation; it records cart and checkout state ownership and provides a release verification workflow. It differs from subscription billing by focusing on one-time cart and order state, and from Stripe-specific guidance by preserving provider-independent commerce invariants.",
  "category": "Billing",
  "icon": "shopping-cart",
  "color": "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "E-commerce checkout pattern for AI agents",
  "metaDescription": "E-commerce cart pricing, promotions, tax, shipping, inventory reservations, idempotent orders, payment reconciliation, and checkout testing. In production.",
  "problem": "AI agents often trust client totals, decrement inventory before payment without expiry, create duplicate orders on retry, or mark an order paid from the browser redirect alone.",
  "audience": "Commerce teams operating carts, physical or digital inventory, one-time payments, and fulfillment",
  "prevents": [
    "Charging a client-manipulated price or discount",
    "Overselling stock through concurrent checkouts",
    "Creating several orders from one checkout retry",
    "Fulfilling an order before authoritative payment confirmation"
  ],
  "appliesTo": {
    "paths": [
      "/src/commerce",
      "/src/payments",
      "/tests/checkout"
    ],
    "stacks": [
      "ecommerce",
      "checkout",
      "payments",
      "inventory",
      "orders"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/commerce",
      "title": "Calculate payable totals from server-owned inputs",
      "summary": "Resolve catalog version, price, currency, promotion, tax, shipping, and rounding on the server for every checkout attempt.",
      "body": "The client displays a proposal, not an authority. Product prices, eligibility, stock, tax, shipping, and exchange rules can change between cart editing and payment creation.\n\n- Accept stable product, variant, quantity, and promotion identifiers from the client, then load current authorized commerce data on the server.\n- Calculate money in integer minor units or an exact decimal representation with one documented rounding policy per currency and tax boundary.\n- Return a priced checkout snapshot with version and expiry so the UI can explain changes instead of silently charging a different total.\n- Store the exact line, discount, tax, shipping, currency, and total breakdown accepted for the order rather than recomputing historical orders from the current catalog.\n\nSee /src/payments for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/commerce",
      "title": "Reserve scarce inventory through one atomic transition",
      "summary": "Check availability and create a bounded reservation together, then commit, release, or expire it by stable checkout identity.",
      "body": "Reading stock and decrementing later lets concurrent checkouts each observe the same unit. Holding inventory forever on abandoned payment attempts creates a different availability failure.\n\n- Perform availability check and reservation update in one database transaction or atomic inventory service operation.\n- Give the reservation a checkout or order identity, quantity, expiry, and status so retries return the same reservation.\n- Commit the reservation when authoritative payment and order policy allow fulfillment; release it on terminal failure or cancellation.\n- Expire abandoned reservations through idempotent scheduled work and reconcile inventory records rather than deleting evidence blindly.\n\nSee /tests/checkout for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/commerce",
      "title": "Create one order per logical checkout",
      "summary": "Use a stable checkout idempotency key and persist order state before redirecting or calling payment infrastructure.",
      "body": "Browser retries, double clicks, gateway timeouts, and payment redirects can repeat checkout creation. A fresh order ID on every request turns one intent into several payable records.\n\n- Create the logical checkout identity before external payment calls and enforce uniqueness at the server boundary.\n- Persist the order and priced snapshot in a pending state, then reuse them when the same identity returns.\n- Propagate the same identity into payment-provider idempotency and metadata fields without using mutable or personal values as keys.\n- Disable duplicate UI submission for usability, but rely on database and provider idempotency for correctness.\n\nSee /src/payments for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/payments",
      "title": "Advance order state from authoritative payment evidence",
      "summary": "Verify provider events or server-side status and make state transitions monotonic before fulfillment begins.",
      "body": "A success page, client callback, or redirect parameter can be forged, replayed, abandoned, or reached before the provider's durable result. Fulfillment needs server-verified payment state.\n\n- Verify event signature and account context or retrieve payment state through authenticated server APIs before changing the order.\n- Handle duplicate and out-of-order events idempotently and reject transitions that would move a terminal order backward.\n- Store provider payment identity, amount, currency, capture state, and event identity needed for reconciliation without retaining prohibited payment data.\n- Start fulfillment through a durable outbox or job after the paid transition commits, not directly inside a webhook response.\n\nSee /src/commerce for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/commerce",
      "title": "The cart is editable intent while the order is an immutable snapshot",
      "summary": "Let carts change freely, but copy accepted commercial terms into an order that later catalog edits cannot rewrite.",
      "body": "A cart belongs to an active shopping session and may hold stale or unavailable choices. An order is a financial and fulfillment record whose line identity and totals must remain understandable after products, names, or prices change.\n\n- Store stable product and variant references in the cart and reprice before checkout rather than treating cached display values as current.\n- Copy customer-facing description, quantity, unit price, discounts, tax, shipping, currency, and total into the accepted order.\n- Append order adjustments, refunds, cancellations, and fulfillment events instead of mutating history to resemble the latest catalog.\n- Merge anonymous and authenticated carts through an explicit product policy that resolves duplicates, quantities, ownership, and expired items.\n\nSee /src/payments for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/src/commerce",
      "title": "Checkout is a recoverable state machine",
      "summary": "Persist progress and authoritative identifiers so refresh, return, authentication, challenge, and provider delay resume one checkout.",
      "body": "Checkout spans browser navigation and external systems. Treating it as one request loses state when the user authenticates, returns from payment, closes a tab, or waits for asynchronous confirmation.\n\n- Model pricing, reservation, order creation, payment pending, challenge, paid, failed, expired, and cancelled states with allowed transitions.\n- Store only the minimum browser state needed to resume and recover authoritative status from the server by checkout identity.\n- Make return routes safe to reload and revisit; they query state instead of repeating payment or order creation.\n- Surface pending and recoverable failures honestly, including a path to retry payment without creating a second order or reservation.\n\nSee /tests/checkout for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "verify-checkout-state-machine",
      "summary": "Exercise pricing, stock contention, retries, payment outcomes, browser returns, events, and fulfillment as one checkout flow.",
      "body": "---\nname: verify-checkout-state-machine\ndescription: Verify an e-commerce checkout change before accepting production payments.\n---\n\n# Verify Checkout State Machine\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n1. Test stale prices, invalid promotions, tax and shipping changes, currency rounding, missing products, and quantities at inventory boundaries.\n2. Run concurrent checkouts for the last units and prove reservations prevent oversell, expire safely, and remain idempotent on retry.\n3. Repeat order and payment creation through double click, timeout, reload, back navigation, and duplicate client requests with the same logical key.\n4. Replay valid, duplicate, out-of-order, delayed, malformed, wrong-account, wrong-amount, authorized, captured, failed, and cancelled payment evidence.\n5. Verify fulfillment starts once after committed paid state, and reconcile every order against payment and inventory records after induced partial failures.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "ecommerce",
        "checkout",
        "payments",
        "inventory",
        "testing"
      ]
    }
  ]
};
