import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Banknote, 
  Check, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { usePOSStore } from '../../store';
import { formatCurrency } from '../../utils/format';
import { PaymentDetail } from '../../types';
import { clsx } from 'clsx';
import { Kbd } from '../ui/Kbd';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PaymentMethod = 'cash' | 'card';

const QUICK_CASH_AMOUNTS = [1, 5, 10, 20, 50];

export function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
  const { currentSale, completeSale } = usePOSStore();
  const total = currentSale?.total || 0;

  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [isComplete, setIsComplete] = useState(false);
  const [change, setChange] = useState(0);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setMethod('cash');
      setCashReceived('');
      setIsComplete(false);
      setChange(0);
    }
  }, [isOpen]);

  const cashAmount = parseFloat(cashReceived) || 0;
  const canComplete = method === 'card' || cashAmount >= total;

  const handleComplete = () => {
    if (!canComplete) return;

    const payments: PaymentDetail[] = [];
    
    if (method === 'cash') {
      payments.push({ method: 'cash', amount: total });
      setChange(cashAmount - total);
    } else if (method === 'card') {
      payments.push({ method: 'card', amount: total });
    }

    setIsComplete(true);

    // Auto close after showing receipt
    setTimeout(() => {
      completeSale(payments);
      onClose();
    }, 2000);
  };

  const handleQuickCash = (amount: number) => {
    setCashReceived(amount.toString());
  };

  const handleKeypadPress = (key: string) => {
    if (key === 'C') {
      setCashReceived('');
    } else if (key === '⌫') {
      setCashReceived(prev => prev.slice(0, -1));
    } else if (key === '.') {
      if (!cashReceived.includes('.')) {
        setCashReceived(prev => prev + '.');
      }
    } else {
      // Limit to 3 decimal places (JOD fils)
      const parts = cashReceived.split('.');
      if (parts[1] && parts[1].length >= 3) return;
      setCashReceived(prev => prev + key);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen || isComplete) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && canComplete) {
        e.preventDefault();
        handleComplete();
      }
      if (e.key === '1') setMethod('cash');
      if (e.key === '2') setMethod('card');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isComplete, canComplete]);

  if (!currentSale) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showClose={!isComplete}>
      {isComplete ? (
        // Success Screen
        <div className="py-8 text-center animate-scale-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent to-accent-700 flex items-center justify-center shadow-xl shadow-accent/40">
            <Check size={32} className="text-white" strokeWidth={3} />
          </div>
          <h2 className="text-2xl font-bold text-surface-900 mb-1">
            Payment Complete!
          </h2>
          {method === 'cash' && change > 0 && (
            <div className="my-4 px-4 py-2 bg-accent-50 rounded-xl inline-block">
              <p className="text-xs text-accent-600">Change Due</p>
              <p className="text-2xl font-bold text-accent">
                {formatCurrency(change)}
              </p>
            </div>
          )}
          <p className="text-sm text-surface-500">
            Receipt #{currentSale.id.slice(-8).toUpperCase()}
          </p>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-surface-400">
            <Sparkles size={12} />
            <span>Thank you!</span>
          </div>
        </div>
      ) : (
        // Payment Form
        <div className="space-y-3">
          {/* Total + Payment Methods in one row */}
          <div className="flex items-center gap-3">
            <div className="flex-1 text-center py-2 bg-surface-50 rounded-xl">
              <p className="text-[10px] text-surface-500 uppercase tracking-wide">Total</p>
              <p className="text-xl font-bold text-surface-900 tabular-nums">
                {formatCurrency(total)}
              </p>
            </div>
            <button
              onClick={() => setMethod('cash')}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-3 rounded-xl font-semibold text-sm transition-all',
                method === 'cash'
                  ? 'bg-accent text-white shadow-md'
                  : 'bg-surface-100 text-surface-600'
              )}
            >
              <Banknote size={16} />
              <span>Cash</span>
            </button>
            <button
              onClick={() => setMethod('card')}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-3 rounded-xl font-semibold text-sm transition-all',
                method === 'card'
                  ? 'bg-accent text-white shadow-md'
                  : 'bg-surface-100 text-surface-600'
              )}
            >
              <CreditCard size={16} />
              <span>Card</span>
            </button>
          </div>

          {/* Cash Payment */}
          {method === 'cash' && (
            <div className="space-y-2 animate-fade-in">
              {/* Cash Received Display */}
              <div className="relative text-center py-2 bg-white rounded-xl border-2 border-surface-200">
                <p className="text-[10px] text-surface-400 uppercase tracking-wide">Cash Received</p>
                <p className="text-2xl font-bold tabular-nums text-surface-900">
                  {cashReceived ? `${cashReceived} JOD` : '0.000 JOD'}
                </p>
                {cashAmount > 0 && cashAmount >= total && (
                  <span className="absolute top-1 right-2 px-2 py-0.5 bg-accent text-white text-[10px] font-bold rounded-full">
                    Change: {formatCurrency(cashAmount - total)}
                  </span>
                )}
              </div>

              {/* Quick Cash + Exact in one row */}
              <div className="flex gap-1.5">
                {QUICK_CASH_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleQuickCash(amount)}
                    className="flex-1 py-2 bg-surface-50 hover:bg-surface-100 rounded-lg font-bold text-xs text-surface-700 transition-colors border border-surface-200"
                  >
                    {amount}
                  </button>
                ))}
                <button
                  onClick={() => setCashReceived(total.toFixed(3))}
                  className="flex-1 py-2 bg-accent-50 hover:bg-accent-100 text-accent rounded-lg font-bold text-xs transition-colors border border-accent-200"
                >
                  Exact
                </button>
              </div>

              {/* Compact Keypad */}
              <div className="grid grid-cols-3 gap-1">
                {['7', '8', '9', '4', '5', '6', '1', '2', '3', 'C', '0', '.'].map((key) => (
                  <button
                    key={key}
                    onClick={() => handleKeypadPress(key)}
                    className={clsx(
                      'py-2.5 rounded-lg font-bold text-base transition-all active:scale-95',
                      key === 'C'
                        ? 'bg-danger-100 text-danger'
                        : 'bg-surface-100 text-surface-800 hover:bg-surface-200'
                    )}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Card Payment */}
          {method === 'card' && (
            <div className="py-6 text-center animate-fade-in">
              <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg animate-pulse-soft">
                <CreditCard size={24} className="text-white" />
              </div>
              <p className="font-medium text-surface-700 text-sm">Present card to terminal</p>
              <p className="text-xs text-surface-400 mt-1">Tap or insert card</p>
            </div>
          )}

          {/* Complete Button */}
          <button
            onClick={handleComplete}
            disabled={!canComplete}
            className={clsx(
              'w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all',
              canComplete
                ? 'bg-gradient-to-b from-accent to-accent-700 text-white shadow-lg shadow-accent/30 active:scale-[0.98]'
                : 'bg-surface-200 text-surface-400 cursor-not-allowed'
            )}
          >
            <span>Complete Sale</span>
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </Modal>
  );
}
