import { ShoppingCart, ParkingCircle, Trash2, Receipt, User, Sparkles } from 'lucide-react';
import { usePOSStore } from '../../store';
import { formatCurrency } from '../../utils/format';
import { CartItem } from './CartItem';
import { EmptyState } from '../ui/EmptyState';
import { Kbd } from '../ui/Kbd';
import { useState } from 'react';
import { clsx } from 'clsx';

interface CartProps {
  onCheckout: () => void;
}

export function Cart({ onCheckout }: CartProps) {
  const {
    currentSale,
    updateCartItemQuantity,
    removeFromCart,
    applyItemDiscount,
    clearCart,
    parkSale,
    setCustomerInfo,
    parkedSales,
    resumeSale,
  } = usePOSStore();

  const [showCustomer, setShowCustomer] = useState(false);
  const [customerName, setCustomerName] = useState('');

  const items = currentSale?.items || [];
  const subtotal = currentSale?.subtotal || 0;
  const discount = currentSale?.discount || 0;
  const tax = currentSale?.tax || 0;
  const total = currentSale?.total || 0;

  const handlePark = () => {
    if (items.length > 0) {
      parkSale();
    }
  };

  const handleAddCustomer = () => {
    if (customerName.trim()) {
      setCustomerInfo(customerName.trim());
      setShowCustomer(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-white to-surface-50 border-l border-surface-200">
      {/* Header */}
      <div className="px-5 py-4 bg-white border-b border-surface-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-700 flex items-center justify-center shadow-lg shadow-accent/20">
              <ShoppingCart size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-surface-900">Current Sale</h2>
              <p className="text-xs text-surface-500">
                {items.length === 0 ? 'No items yet' : `${items.length} item${items.length > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          
          {items.length > 0 && (
            <div className="flex items-center gap-1">
              <button
                onClick={handlePark}
                className="p-2.5 rounded-xl text-surface-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                title="Park sale (P)"
              >
                <ParkingCircle size={20} />
              </button>
              <button
                onClick={clearCart}
                className="p-2.5 rounded-xl text-surface-500 hover:text-danger hover:bg-danger-50 transition-colors"
                title="Clear cart"
              >
                <Trash2 size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Parked Sales Quick Access */}
        {parkedSales.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
            {parkedSales.map((sale, index) => (
              <button
                key={sale.id}
                onClick={() => resumeSale(sale.id)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors whitespace-nowrap border border-blue-100"
              >
                <ParkingCircle size={14} />
                <span>Sale #{index + 1}</span>
                <span className="text-blue-500 font-bold">
                  {formatCurrency(sale.total)}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Customer */}
        {currentSale?.customerName ? (
          <div className="mt-3 flex items-center gap-2 px-3 py-2.5 bg-surface-50 rounded-xl border border-surface-100">
            <div className="w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center">
              <User size={16} className="text-accent" />
            </div>
            <span className="flex-1 font-medium text-surface-700">{currentSale.customerName}</span>
            <button
              onClick={() => setCustomerInfo('')}
              className="text-xs text-surface-500 hover:text-surface-700 px-2 py-1 hover:bg-surface-100 rounded-lg transition-colors"
            >
              Remove
            </button>
          </div>
        ) : showCustomer ? (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer name"
              className="flex-1 input text-sm py-2.5"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddCustomer();
                if (e.key === 'Escape') setShowCustomer(false);
              }}
            />
            <button onClick={handleAddCustomer} className="btn-primary py-2.5 px-4 text-sm">
              Add
            </button>
          </div>
        ) : items.length > 0 && (
          <button
            onClick={() => setShowCustomer(true)}
            className="mt-3 flex items-center gap-2 text-sm text-surface-500 hover:text-accent transition-colors"
          >
            <User size={14} />
            <span>Add customer</span>
          </button>
        )}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-5">
        {items.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="Cart is empty"
            description="Tap products to add them to the cart"
          />
        ) : (
          <div className="divide-y divide-surface-100">
            {items.map((item) => (
              <CartItem
                key={item.product.id}
                item={item}
                onUpdateQuantity={(qty) => updateCartItemQuantity(item.product.id, qty)}
                onRemove={() => removeFromCart(item.product.id)}
                onApplyDiscount={(disc) => applyItemDiscount(item.product.id, disc)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Totals & Checkout */}
      {items.length > 0 && (
        <div className="border-t border-surface-200 p-5 space-y-4 bg-white rounded-t-3xl shadow-[0_-8px_30px_-10px_rgba(0,0,0,0.1)]">
          {/* Totals Breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-surface-500">Subtotal</span>
              <span className="font-medium tabular-nums">{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-accent font-medium flex items-center gap-1">
                  <Sparkles size={14} />
                  Discount
                </span>
                <span className="text-accent font-medium tabular-nums">−{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-surface-500">Tax (16%)</span>
              <span className="font-medium tabular-nums">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-dashed border-surface-200">
              <span className="text-lg font-bold text-surface-900">Total</span>
              <span className="text-2xl font-bold text-accent tabular-nums">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={onCheckout}
            className="btn-primary w-full py-4 text-lg"
          >
            <Receipt size={22} />
            <span>Checkout</span>
            <Kbd className="ml-auto bg-white/20 border-white/30 text-white">F2</Kbd>
          </button>
        </div>
      )}
    </div>
  );
}
