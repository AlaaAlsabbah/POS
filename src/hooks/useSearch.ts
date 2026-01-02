import { useState, useMemo } from 'react';
import { Product } from '../types';

export function useProductSearch(products: Product[], category: string = 'All') {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    let result = products;

    // Filter by category
    if (category !== 'All') {
      result = result.filter(p => p.category === category);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          p.barcode?.includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }

    return result;
  }, [products, category, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredProducts,
  };
}

