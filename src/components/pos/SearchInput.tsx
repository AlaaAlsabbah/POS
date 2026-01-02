import { Search, X, Scan } from 'lucide-react';
import { useRef, useEffect } from 'react';
import { Kbd } from '../ui/Kbd';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search products...',
  autoFocus = false,
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search on "/" key
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
        <Search size={20} className="text-surface-400" />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full pl-12 pr-24 py-4 rounded-2xl border-2 border-surface-200 bg-white text-surface-900 text-lg placeholder:text-surface-400 transition-all duration-200 hover:border-surface-300 focus:border-accent focus:ring-4 focus:ring-accent/10 focus:outline-none"
      />
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {value ? (
          <button
            onClick={() => onChange('')}
            className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-600 transition-colors"
          >
            <X size={18} />
          </button>
        ) : (
          <>
            <Kbd>/</Kbd>
            <div className="w-px h-4 bg-surface-200" />
            <Scan size={18} className="text-surface-300" />
          </>
        )}
      </div>
    </div>
  );
}
