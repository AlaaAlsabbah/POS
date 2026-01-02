import { clsx } from 'clsx';
import { Package, AlertCircle, Plus } from 'lucide-react';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/format';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  const isLowStock = product.stock <= 5;
  const isOutOfStock = product.stock === 0;

  // Category color mapping for visual variety
  const categoryColors: Record<string, string> = {
    'Beverages': 'from-blue-500/10 to-blue-600/5 group-hover:from-blue-500/20',
    'Snacks': 'from-amber-500/10 to-amber-600/5 group-hover:from-amber-500/20',
    'Dairy': 'from-cyan-500/10 to-cyan-600/5 group-hover:from-cyan-500/20',
    'Bakery': 'from-orange-500/10 to-orange-600/5 group-hover:from-orange-500/20',
    'Produce': 'from-green-500/10 to-green-600/5 group-hover:from-green-500/20',
    'Meat': 'from-red-500/10 to-red-600/5 group-hover:from-red-500/20',
    'Household': 'from-purple-500/10 to-purple-600/5 group-hover:from-purple-500/20',
    'Personal Care': 'from-pink-500/10 to-pink-600/5 group-hover:from-pink-500/20',
  };

  const bgGradient = categoryColors[product.category] || 'from-surface-100 to-surface-50';

  return (
    <button
      onClick={() => !isOutOfStock && onAdd(product)}
      disabled={isOutOfStock}
      className={clsx(
        'group relative flex flex-col p-4 rounded-2xl text-left transition-all duration-200',
        'border-2 overflow-hidden',
        isOutOfStock
          ? 'bg-surface-100 border-surface-200 opacity-60 cursor-not-allowed'
          : 'bg-white border-surface-100 hover:border-accent/30 hover:shadow-lg hover:-translate-y-1 active:translate-y-0 active:shadow-md'
      )}
    >
      {/* Background gradient */}
      <div className={clsx(
        'absolute inset-0 bg-gradient-to-br transition-all duration-300',
        bgGradient
      )} />

      {/* Content */}
      <div className="relative">
        {/* Product Icon/Image */}
        <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center mb-3 group-hover:shadow-md transition-shadow">
          <Package size={26} className="text-surface-400 group-hover:text-accent transition-colors" />
        </div>

        {/* Category Badge */}
        <span className="inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-surface-500 bg-white/80 rounded-full mb-2">
          {product.category}
        </span>

        {/* Product Info */}
        <h3 className="font-semibold text-surface-900 leading-snug mb-1 line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        
        <p className="text-xs text-surface-400 font-mono mb-3">{product.sku}</p>

        {/* Price and Stock */}
        <div className="flex items-end justify-between">
          <span className="text-xl font-bold text-accent">
            {formatCurrency(product.price)}
          </span>
          
          {isOutOfStock ? (
            <span className="flex items-center gap-1 text-xs text-danger font-semibold">
              <AlertCircle size={12} />
              Out of stock
            </span>
          ) : isLowStock ? (
            <span className="flex items-center gap-1 text-xs text-warning font-semibold">
              <AlertCircle size={12} />
              {product.stock} left
            </span>
          ) : (
            <span className="text-xs text-surface-400 font-medium">{product.stock} in stock</span>
          )}
        </div>
      </div>

      {/* Add to cart indicator */}
      {!isOutOfStock && (
        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all shadow-lg">
          <Plus size={18} strokeWidth={2.5} />
        </div>
      )}
    </button>
  );
}
