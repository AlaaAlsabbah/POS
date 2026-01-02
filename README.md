# Celtis POS

A modern, thoughtfully designed Point of Sale interface built for speed, clarity, and all-day usability.

![POS Interface](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-blue) ![Zustand](https://img.shields.io/badge/Zustand-5.0-orange)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The app will be available at `http://localhost:5173`

---

## 🎯 Design Philosophy

### User-Centered Approach

This POS was designed with **cashier ergonomics** as the primary concern. Someone using this system 8 hours a day needs:

- **Minimal clicks** to complete common tasks
- **Clear visual hierarchy** that guides the eye naturally
- **Keyboard shortcuts** for power users
- **Calm aesthetics** that don't cause eye strain

### Sale States, Not Just Screens

The internal data model treats sales as **stateful entities**, not just UI screens:

```
                    ┌─→ Parked (save for later)
                    │
Draft (in progress) ├─→ Completed (payment received) ─→ Refunded (with reason)
                    │
                    └─→ Voided (cancelled)
```

This enables natural workflows like:
- Starting a sale, parking it when the customer forgot their wallet
- Resuming parked sales seamlessly
- Tracking refunds with full audit trail

---

## ✨ Features Implemented

### Core Sale Flow
| Feature | Description |
|---------|-------------|
| Product Search | Search by name, SKU, or barcode with `/` shortcut |
| Category Filtering | Quick navigation with emoji indicators |
| Cart Management | Add, remove, adjust quantities |
| Per-item Discounts | Toggle 10% discount with one click |
| Customer Association | Optional customer name attachment |

### Payment Processing
| Feature | Description |
|---------|-------------|
| Cash Payment | Full keypad with change calculation |
| Quick Cash Buttons | 1, 5, 10, 20, 50 JOD presets |
| Exact Amount | One-click exact payment |
| Card Payment | Simulated card terminal flow |
| Success Feedback | Visual confirmation with receipt number |

### Sale Lifecycle
| Feature | Description |
|---------|-------------|
| Parked Sales | Save current sale, start new one |
| Resume Sales | One-click resume any parked sale |
| Auto-Park | Automatically parks when starting new sale |
| Void Sales | Cancel sale before payment |
| Refunds | Issue refund with reason tracking |

### History & Reports
| Feature | Description |
|---------|-------------|
| Sales History | Full transaction log with filtering |
| Status Filters | Completed, Refunded, Voided |
| Search | By receipt #, customer, or product |
| Daily Stats | Today's sales and revenue |
| Top Products | Best sellers by revenue |
| Category Breakdown | Sales by product category |
| Payment Split | Cash vs Card analytics |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `/` | Focus product search |
| `F2` | Open checkout (when cart has items) |
| `P` | Park current sale |
| `N` | Start new sale |
| `Escape` | Close modals |
| `1` | Select Cash payment |
| `2` | Select Card payment |
| `Enter` | Complete payment |

---

## 🛠 Technical Decisions

### Why Zustand for State Management?
- **Simplicity**: ~200 lines for entire store
- **TypeScript**: First-class type support
- **Persistence**: Built-in localStorage middleware
- **No boilerplate**: No actions, reducers, or selectors

### Why TailwindCSS?
- **Rapid iteration**: Style directly in JSX
- **Design system**: Custom tokens for consistency
- **Bundle size**: Only ships used styles
- **Dark mode ready**: (not implemented, but trivial to add)

### Persistence Strategy
All critical data persists to localStorage:
```typescript
// Persisted automatically:
- currentSale (cart state)
- sales (completed transactions)
- parkedSales (saved for later)
- currentCashier
```

This handles "messy scenarios":
- ✅ Page refresh during sale → cart preserved
- ✅ Accidental navigation → data safe
- ✅ Browser crash → recoverable state
- ✅ Tab close/reopen → everything restored

---

## 🗂 Project Structure

```
src/
├── components/
│   ├── layout/          # Header, Layout wrapper
│   │   ├── Header.tsx   # Navigation, cashier info, time
│   │   └── Layout.tsx   # Route wrapper
│   ├── pos/             # Sale-related components
│   │   ├── Cart.tsx         # Cart sidebar
│   │   ├── CartItem.tsx     # Individual cart item
│   │   ├── CategoryTabs.tsx # Category filter tabs
│   │   ├── PaymentModal.tsx # Checkout flow
│   │   ├── ProductCard.tsx  # Product tile
│   │   ├── ProductGrid.tsx  # Product listing
│   │   └── SearchInput.tsx  # Search bar
│   └── ui/              # Reusable UI primitives
│       ├── Badge.tsx    # Status badges
│       ├── EmptyState.tsx
│       ├── Kbd.tsx      # Keyboard shortcut display
│       └── Modal.tsx    # Modal wrapper
├── data/                # Mock data
│   ├── cashiers.ts      # Staff list
│   └── products.ts      # Product catalog (40+ items)
├── hooks/               # Custom React hooks
│   ├── useKeyboardShortcuts.ts
│   └── useSearch.ts
├── pages/               # Route components
│   ├── POSPage.tsx      # Main POS interface
│   ├── HistoryPage.tsx  # Sales history
│   └── ReportsPage.tsx  # Analytics dashboard
├── store/               # State management
│   └── index.ts         # Zustand store
├── types/               # TypeScript definitions
│   └── index.ts         # All interfaces
└── utils/               # Helper functions
    └── format.ts        # Currency, date formatting
```

---

## 📝 Assumptions & Simplifications

| Decision | Rationale |
|----------|-----------|
| Single register | No multi-terminal sync needed for demo |
| Fixed 16% tax | Would be configurable in production |
| Simple discounts | Per-item % only, no promo codes |
| Mock inventory | Stock numbers are static |
| No authentication | Cashier auto-selected for demo |
| JOD currency | Jordanian Dinar, 3 decimal places |

---

## 🎨 Design Highlights

### Color Palette
- **Accent**: Deep forest green (#2d5a45) - calm, professional
- **Surfaces**: Warm grays with slight yellow undertone
- **Danger**: Muted red (#b84a4a) - alerts without alarm
- **Warning**: Amber (#c4870f) - gentle attention

### Typography
- **Body**: DM Sans - friendly, highly readable
- **Numbers**: JetBrains Mono - perfect for prices/totals

### UX Principles
- **Large touch targets** (min 44px)
- **Consistent spacing** (4px/8px grid)
- **Clear feedback** on all interactions
- **Calm colors** for all-day use

---

## 🔮 Future Considerations

If this were a production product:

- **Barcode scanner** integration (Web USB API)
- **Receipt printing** (thermal printer support)
- **Split payments** (part cash, part card)
- **Customer database** with purchase history
- **Inventory management** with low-stock alerts
- **End-of-day reconciliation**
- **Multi-language** support (i18n)
- **Offline-first** with background sync
- **Dark mode** theme option

---

## 📋 Requirements Checklist

### Core Requirements ✅
- [x] Frontend-only (no backend/database)
- [x] Mock data with localStorage persistence
- [x] Product thinking demonstrated
- [x] UI clarity and visual hierarchy
- [x] Connected user flows
- [x] Readable, calm interface

### What Matters Most ✅
- [x] Font choice (DM Sans + JetBrains Mono)
- [x] Consistent sizing and spacing
- [x] Clear alignment throughout
- [x] Information hierarchy
- [x] All-day usability focus

### Inspiration Ideas Implemented ✅
- [x] Draft/parked sales
- [x] Refunds as states (with reason tracking)
- [x] Basic sales history with filtering
- [x] Simple reporting dashboard
- [x] Staff concept (cashier display)

### Standout Elements ✅
- [x] Sale states (draft → parked/completed/voided → refunded)
- [x] Clean internal data model
- [x] Keyboard shortcuts for speed
- [x] Page refresh handling
- [x] Accidental navigation protection
- [x] Real store workflow empathy

---

Built with care for the Celtis Australis Frontend Engineer assessment.
