import { Minus, Plus, Trash2, Percent } from 'lucide-react';
import { CartItem as CartItemType } from '../../types';
import { formatCurrency } from '../../utils/format';
import { clsx } from 'clsx';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
  onApplyDiscount: (discount: number) => void;
}

export function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
  onApplyDiscount,
}: CartItemProps) {
  const { product, quantity, discount } = item;
  const lineTotal = product.price * quantity;
  const discountAmount = lineTotal * (discount / 100);
  const finalTotal = lineTotal - discountAmount;

  return (
    <div className="group py-4 animate-slide-up">
      <div className="flex items-start gap-3">
        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-surface-900 truncate pr-2 mb-0.5">
            {product.name}
          </h4>
          <p className="text-sm text-surface-500">
            {formatCurrency(product.price)} × {quantity}
          </p>
        </div>

        {/* Line Total */}
        <div className="text-right">
          <p className={clsx(
            'text-lg font-bold tabular-nums',
            discount > 0 ? 'text-accent' : 'text-surface-900'
          )}>
            {formatCurrency(finalTotal)}
          </p>
          {discount > 0 && (
            <p className="text-xs text-surface-400 line-through tabular-nums">
              {formatCurrency(lineTotal)}
            </p>
          )}
        </div>
      </div>

      {/* Controls Row */}
      <div className="flex items-center justify-between mt-3">
        {/* Quantity Controls */}
        <div className="flex items-center bg-surface-100 rounded-xl p-1">
          <button
            onClick={() => onUpdateQuantity(quantity - 1)}
            className="w-9 h-9 rounded-lg bg-white hover:bg-surface-50 flex items-center justify-center text-surface-600 transition-all shadow-sm active:scale-95"
          >
            <Minus size={16} strokeWidth={2.5} />
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val) && val > 0) {
                onUpdateQuantity(val);
              }
            }}
            className="w-12 h-9 text-center text-sm font-bold bg-transparent focus:outline-none"
            min={1}
          />
          <button
            onClick={() => onUpdateQuantity(quantity + 1)}
            className="w-9 h-9 rounded-lg bg-white hover:bg-surface-50 flex items-center justify-center text-surface-600 transition-all shadow-sm active:scale-95"
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Discount & Remove */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Discount Toggle */}
          <button
            onClick={() => {
              const newDiscount = discount > 0 ? 0 : 10; // Toggle 10% discount
              onApplyDiscount(newDiscount);
            }}
            className={clsx(
              'w-9 h-9 rounded-lg flex items-center justify-center transition-all active:scale-95',
              discount > 0
                ? 'bg-accent text-white shadow-md'
                : 'bg-surface-100 text-surface-500 hover:bg-surface-200 hover:text-surface-700'
            )}
            title={discount > 0 ? `${discount}% discount applied` : 'Add 10% discount'}
          >
            <Percent size={14} strokeWidth={2.5} />
          </button>

          {/* Remove */}
          <button
            onClick={onRemove}
            className="w-9 h-9 rounded-lg bg-surface-100 hover:bg-danger-100 flex items-center justify-center text-surface-500 hover:text-danger transition-all active:scale-95"
            title="Remove item"
          >
            <Trash2 size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Discount Badge */}
      {discount > 0 && (
        <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1 bg-accent-50 rounded-lg text-xs">
          <span className="font-bold text-accent">{discount}% OFF</span>
          <span className="text-accent-600">−{formatCurrency(discountAmount)}</span>
        </div>
      )}
    </div>
  );
}
