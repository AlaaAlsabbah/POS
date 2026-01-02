import { clsx } from 'clsx';
import { CATEGORIES } from '../../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

interface CategoryTabsProps {
  selected: string;
  onSelect: (category: string) => void;
}

// Category icons/emojis for visual appeal
const categoryEmojis: Record<string, string> = {
  'All': '🏪',
  'Beverages': '🥤',
  'Snacks': '🍿',
  'Dairy': '🥛',
  'Bakery': '🥐',
  'Produce': '🥬',
  'Meat': '🥩',
  'Household': '🧹',
  'Personal Care': '🧴',
};

export function CategoryTabs({ selected, onSelect }: CategoryTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative flex items-center">
      {/* Left Arrow */}
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 z-10 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-md border border-surface-200 text-surface-600 hover:text-surface-800 hover:bg-surface-50"
        >
          <ChevronLeft size={18} />
        </button>
      )}

      {/* Tabs Container */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className={clsx(
          "flex gap-2 overflow-x-auto scrollbar-hide py-1",
          showLeftArrow && "pl-10",
          showRightArrow && "pr-10"
        )}
      >
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => onSelect(category)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0',
              selected === category
                ? 'bg-gradient-to-b from-accent to-accent-700 text-white shadow-md shadow-accent/30'
                : 'bg-white text-surface-600 hover:bg-surface-50 hover:text-surface-800 border border-surface-200'
            )}
          >
            <span className="text-base">{categoryEmojis[category] || '📦'}</span>
            <span>{category}</span>
          </button>
        ))}
      </div>

      {/* Right Arrow */}
      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 z-10 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-md border border-surface-200 text-surface-600 hover:text-surface-800 hover:bg-surface-50"
        >
          <ChevronRight size={18} />
        </button>
      )}
    </div>
  );
}
