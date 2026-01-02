import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  Product, 
  CartItem, 
  Sale, 
  SaleStatus, 
  PaymentDetail, 
  Cashier,
  TAX_RATE 
} from '../types';
import { products } from '../data/products';
import { cashiers } from '../data/cashiers';

// Generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Generate receipt number (format: RCP-YYYYMMDD-XXXX)
const generateReceiptNumber = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `RCP-${dateStr}-${seq}`;
};

interface POSState {
  // Auth / Session
  currentCashier: Cashier | null;
  setCashier: (cashier: Cashier | null) => void;
  
  // Product catalog
  products: Product[];
  
  // Current sale (cart)
  currentSale: Sale | null;
  
  // Cart operations
  startNewSale: () => void;
  addToCart: (product: Product, quantity?: number) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  applyItemDiscount: (productId: string, discount: number) => void;
  clearCart: () => void;
  setCustomerInfo: (name: string) => void;
  setSaleNote: (note: string) => void;
  
  // Sale lifecycle
  parkSale: () => void;
  resumeSale: (saleId: string) => void;
  completeSale: (payments: PaymentDetail[]) => void;
  voidCurrentSale: () => void;
  refundSale: (saleId: string, reason: string) => void;
  
  // Sales history
  sales: Sale[];
  parkedSales: Sale[];
  getSalesByStatus: (status: SaleStatus) => Sale[];
  getSaleById: (id: string) => Sale | undefined;
  
  // Quick calculations
  getCartSubtotal: () => number;
  getCartTax: () => number;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

export const usePOSStore = create<POSState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentCashier: cashiers[0], // Auto-login first cashier for demo
      products: products,
      currentSale: null,
      sales: [],
      parkedSales: [],
      
      // Auth
      setCashier: (cashier) => set({ currentCashier: cashier }),
      
      // Start a fresh sale
      startNewSale: () => {
        const { currentCashier, currentSale, parkedSales } = get();
        if (!currentCashier) return;
        
        // If there's an active sale with items, park it first
        if (currentSale && currentSale.items.length > 0 && currentSale.status === 'draft') {
          set({
            parkedSales: [...parkedSales, { ...currentSale, status: 'parked' as const }],
          });
        }
        
        const newSale: Sale = {
          id: generateId(),
          items: [],
          subtotal: 0,
          discount: 0,
          tax: 0,
          total: 0,
          status: 'draft',
          payments: [],
          cashierId: currentCashier.id,
          createdAt: new Date().toISOString(),
        };
        
        set({ currentSale: newSale });
      },
      
      // Add product to cart
      addToCart: (product, quantity = 1) => {
        const { currentSale, currentCashier } = get();
        
        // Create sale if doesn't exist
        let sale = currentSale;
        if (!sale) {
          if (!currentCashier) return;
          sale = {
            id: generateId(),
            items: [],
            subtotal: 0,
            discount: 0,
            tax: 0,
            total: 0,
            status: 'draft',
            payments: [],
            cashierId: currentCashier.id,
            createdAt: new Date().toISOString(),
          };
        }
        
        // Check if product already in cart
        const existingIndex = sale.items.findIndex(
          item => item.product.id === product.id
        );
        
        let updatedItems: CartItem[];
        if (existingIndex >= 0) {
          // Increase quantity
          updatedItems = sale.items.map((item, idx) =>
            idx === existingIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          // Add new item
          updatedItems = [...sale.items, { product, quantity, discount: 0 }];
        }
        
        const updatedSale = recalculateSaleTotals({ ...sale, items: updatedItems });
        set({ currentSale: updatedSale });
      },
      
      // Update quantity of item in cart
      updateCartItemQuantity: (productId, quantity) => {
        const { currentSale } = get();
        if (!currentSale) return;
        
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        
        const updatedItems = currentSale.items.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        );
        
        const updatedSale = recalculateSaleTotals({ ...currentSale, items: updatedItems });
        set({ currentSale: updatedSale });
      },
      
      // Remove item from cart
      removeFromCart: (productId) => {
        const { currentSale } = get();
        if (!currentSale) return;
        
        const updatedItems = currentSale.items.filter(
          item => item.product.id !== productId
        );
        
        const updatedSale = recalculateSaleTotals({ ...currentSale, items: updatedItems });
        set({ currentSale: updatedSale });
      },
      
      // Apply discount to specific item
      applyItemDiscount: (productId, discount) => {
        const { currentSale } = get();
        if (!currentSale) return;
        
        const updatedItems = currentSale.items.map(item =>
          item.product.id === productId
            ? { ...item, discount: Math.min(100, Math.max(0, discount)) }
            : item
        );
        
        const updatedSale = recalculateSaleTotals({ ...currentSale, items: updatedItems });
        set({ currentSale: updatedSale });
      },
      
      // Clear cart
      clearCart: () => {
        const { currentSale } = get();
        if (!currentSale) return;
        
        set({
          currentSale: {
            ...currentSale,
            items: [],
            subtotal: 0,
            discount: 0,
            tax: 0,
            total: 0,
          },
        });
      },
      
      // Customer info
      setCustomerInfo: (name) => {
        const { currentSale } = get();
        if (!currentSale) return;
        
        set({
          currentSale: { ...currentSale, customerName: name },
        });
      },
      
      // Sale note
      setSaleNote: (note) => {
        const { currentSale } = get();
        if (!currentSale) return;
        
        set({
          currentSale: { ...currentSale, note },
        });
      },
      
      // Park current sale (save for later)
      parkSale: () => {
        const { currentSale, parkedSales } = get();
        if (!currentSale || currentSale.items.length === 0) return;
        
        const parkedSale: Sale = {
          ...currentSale,
          status: 'parked',
        };
        
        set({
          parkedSales: [...parkedSales, parkedSale],
          currentSale: null,
        });
      },
      
      // Resume a parked sale
      resumeSale: (saleId) => {
        const { parkedSales, currentSale, sales } = get();
        const saleToResume = parkedSales.find(s => s.id === saleId);
        
        if (!saleToResume) return;
        
        // Park current sale if it has items
        let updatedParkedSales = parkedSales.filter(s => s.id !== saleId);
        if (currentSale && currentSale.items.length > 0) {
          updatedParkedSales = [...updatedParkedSales, { ...currentSale, status: 'parked' as const }];
        }
        
        set({
          currentSale: { ...saleToResume, status: 'draft' },
          parkedSales: updatedParkedSales,
        });
      },
      
      // Complete sale with payment
      completeSale: (payments) => {
        const { currentSale, sales } = get();
        if (!currentSale || currentSale.items.length === 0) return;
        
        const completedSale: Sale = {
          ...currentSale,
          status: 'completed',
          payments,
          completedAt: new Date().toISOString(),
          receiptNumber: generateReceiptNumber(),
        };
        
        set({
          sales: [completedSale, ...sales],
          currentSale: null,
        });
      },
      
      // Void current sale
      voidCurrentSale: () => {
        const { currentSale, sales } = get();
        if (!currentSale) return;
        
        // If it had items, record it as voided
        if (currentSale.items.length > 0) {
          const voidedSale: Sale = {
            ...currentSale,
            status: 'voided',
            completedAt: new Date().toISOString(),
          };
          set({
            sales: [voidedSale, ...sales],
            currentSale: null,
          });
        } else {
          set({ currentSale: null });
        }
      },
      
      // Refund a completed sale
      refundSale: (saleId, reason) => {
        const { sales } = get();
        
        const updatedSales = sales.map(sale =>
          sale.id === saleId && sale.status === 'completed'
            ? {
                ...sale,
                status: 'refunded' as const,
                refundedAt: new Date().toISOString(),
                refundReason: reason,
              }
            : sale
        );
        
        set({ sales: updatedSales });
      },
      
      // Get sales by status
      getSalesByStatus: (status) => {
        return get().sales.filter(s => s.status === status);
      },
      
      // Get sale by ID
      getSaleById: (id) => {
        const { sales, parkedSales, currentSale } = get();
        if (currentSale?.id === id) return currentSale;
        return [...sales, ...parkedSales].find(s => s.id === id);
      },
      
      // Calculations
      getCartSubtotal: () => {
        const { currentSale } = get();
        if (!currentSale) return 0;
        return currentSale.subtotal;
      },
      
      getCartTax: () => {
        const { currentSale } = get();
        if (!currentSale) return 0;
        return currentSale.tax;
      },
      
      getCartTotal: () => {
        const { currentSale } = get();
        if (!currentSale) return 0;
        return currentSale.total;
      },
      
      getCartItemCount: () => {
        const { currentSale } = get();
        if (!currentSale) return 0;
        return currentSale.items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'celtis-pos-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentSale: state.currentSale,
        sales: state.sales,
        parkedSales: state.parkedSales,
        currentCashier: state.currentCashier,
      }),
    }
  )
);

// Helper to recalculate sale totals
function recalculateSaleTotals(sale: Sale): Sale {
  let subtotal = 0;
  let totalDiscount = 0;
  
  for (const item of sale.items) {
    const itemTotal = item.product.price * item.quantity;
    const itemDiscount = itemTotal * (item.discount / 100);
    subtotal += itemTotal;
    totalDiscount += itemDiscount;
  }
  
  const afterDiscount = subtotal - totalDiscount;
  const tax = afterDiscount * TAX_RATE;
  const total = afterDiscount + tax;
  
  return {
    ...sale,
    subtotal,
    discount: totalDiscount,
    tax,
    total,
  };
}

