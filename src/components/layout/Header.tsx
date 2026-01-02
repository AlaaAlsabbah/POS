import { NavLink } from 'react-router-dom';
import { 
  ShoppingBag, 
  Receipt, 
  BarChart3,
  Clock 
} from 'lucide-react';
import { clsx } from 'clsx';
import { usePOSStore } from '../../store';
import { formatTime } from '../../utils/format';
import { useState, useEffect } from 'react';

export function Header() {
  const { currentCashier, getCartItemCount } = usePOSStore();
  const cartCount = getCartItemCount();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { to: '/', icon: ShoppingBag, label: 'Point of Sale', badge: cartCount },
    { to: '/history', icon: Receipt, label: 'History' },
    { to: '/reports', icon: BarChart3, label: 'Reports' },
  ];

  return (
    <header className="bg-gradient-to-r from-surface-900 via-surface-900 to-surface-800 text-white shadow-lg">
      <div className="flex items-center justify-between px-6 h-16">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-700 flex items-center justify-center shadow-lg shadow-accent/30">
            <span className="font-bold text-base">CP</span>
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight">Celtis POS</span>
            <p className="text-xs text-surface-400 -mt-0.5">Point of Sale System</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2.5 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative',
                  isActive
                    ? 'bg-white text-surface-900 shadow-md'
                    : 'text-surface-300 hover:text-white hover:bg-white/10'
                )
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gradient-to-br from-accent to-accent-700 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-scale-in">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-5">
          {/* Time */}
          <div className="flex items-center gap-2 text-surface-300">
            <Clock size={16} />
            <span className="text-sm font-medium tabular-nums">{formatTime(currentTime)}</span>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-white/10" />

          {/* Cashier */}
          {currentCashier && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-accent/20">
                {currentCashier.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold">{currentCashier.name}</p>
                <p className="text-xs text-surface-400">Cashier</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
