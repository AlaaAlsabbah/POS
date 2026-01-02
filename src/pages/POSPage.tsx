import { useState } from 'react';
import { ProductGrid } from '../components/pos/ProductGrid';
import { Cart } from '../components/pos/Cart';
import { PaymentModal } from '../components/pos/PaymentModal';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { usePOSStore } from '../store';

export function POSPage() {
  const [showPayment, setShowPayment] = useState(false);
  const { currentSale, parkSale, startNewSale } = usePOSStore();

  const canCheckout = currentSale && currentSale.items.length > 0;

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'F2',
      action: () => {
        if (canCheckout) setShowPayment(true);
      },
      description: 'Open checkout',
    },
    {
      key: 'p',
      action: () => {
        if (canCheckout) parkSale();
      },
      description: 'Park current sale',
    },
    {
      key: 'n',
      action: startNewSale,
      description: 'New sale',
    },
    {
      key: 'Escape',
      action: () => setShowPayment(false),
      description: 'Close modal',
    },
  ]);

  return (
    <div className="h-full flex">
      {/* Product Grid - Left Side (flexible) */}
      <div className="flex-1 min-w-0">
        <ProductGrid />
      </div>

      {/* Cart - Right Side (fixed width) */}
      <div className="w-[420px] xl:w-[460px] flex-shrink-0 shadow-2xl">
        <Cart onCheckout={() => setShowPayment(true)} />
      </div>

      {/* Payment Modal */}
      <PaymentModal isOpen={showPayment} onClose={() => setShowPayment(false)} />
    </div>
  );
}
