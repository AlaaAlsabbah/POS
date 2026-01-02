import { useState } from 'react';
import { Package } from 'lucide-react';
import { usePOSStore } from '../../store';
import { useProductSearch } from '../../hooks/useSearch';
import { ProductCard } from './ProductCard';
import { CategoryTabs } from './CategoryTabs';
import { SearchInput } from './SearchInput';
import { EmptyState } from '../ui/EmptyState';

export function ProductGrid() {
  const { products, addToCart } = usePOSStore();
  const [category, setCategory] = useState('All');
  const { searchQuery, setSearchQuery, filteredProducts } = useProductSearch(
    products,
    category
  );

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-surface-50 via-surface-100 to-surface-50">
      {/* Search & Filters */}
      <div className="px-6 py-5 space-y-4 bg-white/80 backdrop-blur-xl border-b border-surface-200 sticky top-0 z-10">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, SKU, or barcode..."
        />
        <CategoryTabs selected={category} onSelect={setCategory} />
      </div>

      {/* Products */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredProducts.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products found"
            description={
              searchQuery
                ? `No results for "${searchQuery}"`
                : `No products in ${category}`
            }
            action={
              searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="btn-secondary"
                >
                  Clear search
                </button>
              )
            }
          />
        ) : (
          <>
            {/* Results count */}
            <div className="mb-4 text-sm text-surface-500">
              Showing <span className="font-semibold text-surface-700">{filteredProducts.length}</span> products
              {category !== 'All' && <span> in {category}</span>}
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={addToCart}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
