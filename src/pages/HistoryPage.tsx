import { useState, useMemo } from 'react';
import { 
  Search, 
  Receipt, 
  ChevronRight,
  X,
  RefreshCw,
  Ban,
  Check,
  Clock,
  User,
  CreditCard,
  Banknote
} from 'lucide-react';
import { usePOSStore } from '../store';
import { Sale, SaleStatus } from '../types';
import { formatCurrency, formatDateTime, formatRelativeTime } from '../utils/format';
import { StatusBadge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { clsx } from 'clsx';

const STATUS_FILTERS: { label: string; value: SaleStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Completed', value: 'completed' },
  { label: 'Refunded', value: 'refunded' },
  { label: 'Voided', value: 'voided' },
];

export function HistoryPage() {
  const { sales, refundSale } = usePOSStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<SaleStatus | 'all'>('all');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');

  // Filter sales
  const filteredSales = useMemo(() => {
    let result = sales;

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(s => s.status === statusFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.receiptNumber?.toLowerCase().includes(query) ||
        s.customerName?.toLowerCase().includes(query) ||
        s.items.some(item => item.product.name.toLowerCase().includes(query))
      );
    }

    return result;
  }, [sales, statusFilter, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const completed = sales.filter(s => s.status === 'completed');
    const refunded = sales.filter(s => s.status === 'refunded');
    const todaySales = completed.filter(s => {
      const saleDate = new Date(s.completedAt!).toDateString();
      return saleDate === new Date().toDateString();
    });
    
    return {
      totalSales: completed.length,
      totalRevenue: completed.reduce((sum, s) => sum + s.total, 0),
      todaySales: todaySales.length,
      todayRevenue: todaySales.reduce((sum, s) => sum + s.total, 0),
      refundedCount: refunded.length,
      refundedAmount: refunded.reduce((sum, s) => sum + s.total, 0),
    };
  }, [sales]);

  const handleRefund = () => {
    if (selectedSale && refundReason.trim()) {
      refundSale(selectedSale.id, refundReason.trim());
      setShowRefundModal(false);
      setRefundReason('');
      setSelectedSale(null);
    }
  };

  return (
    <div className="h-full flex bg-gradient-to-br from-surface-50 to-surface-100">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-6 py-5 bg-white/80 backdrop-blur-xl border-b border-surface-200">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-2xl font-bold text-surface-900">Sales History</h1>
              <p className="text-sm text-surface-500">View and manage past transactions</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-5">
            <div className="p-4 bg-gradient-to-br from-accent-50 to-accent-100/50 rounded-2xl border border-accent-100">
              <p className="text-sm font-medium text-accent-600 mb-1">Today</p>
              <p className="text-2xl font-bold text-surface-900">{stats.todaySales}</p>
              <p className="text-sm text-accent font-semibold">{formatCurrency(stats.todayRevenue)}</p>
            </div>
            <div className="p-4 bg-surface-50 rounded-2xl border border-surface-100">
              <p className="text-sm font-medium text-surface-500 mb-1">Total Sales</p>
              <p className="text-2xl font-bold text-surface-900">{stats.totalSales}</p>
              <p className="text-sm text-surface-600 font-medium">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="p-4 bg-surface-50 rounded-2xl border border-surface-100">
              <p className="text-sm font-medium text-surface-500 mb-1">Refunds</p>
              <p className="text-2xl font-bold text-warning">{stats.refundedCount}</p>
              <p className="text-sm text-surface-600 font-medium">{formatCurrency(stats.refundedAmount)}</p>
            </div>
            <div className="p-4 bg-surface-50 rounded-2xl border border-surface-100">
              <p className="text-sm font-medium text-surface-500 mb-1">Avg. Transaction</p>
              <p className="text-2xl font-bold text-surface-900">
                {stats.totalSales > 0 
                  ? formatCurrency(stats.totalRevenue / stats.totalSales)
                  : formatCurrency(0)
                }
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by receipt #, customer, or product..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-surface-200 bg-white focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-surface-100 rounded-xl p-1">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  className={clsx(
                    'px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                    statusFilter === filter.value
                      ? 'bg-white text-surface-900 shadow-md'
                      : 'text-surface-500 hover:text-surface-700'
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sales List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredSales.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No sales found"
              description={
                searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Completed sales will appear here'
              }
            />
          ) : (
            <div className="space-y-3">
              {filteredSales.map((sale) => (
                <button
                  key={sale.id}
                  onClick={() => setSelectedSale(sale)}
                  className={clsx(
                    'w-full flex items-center gap-4 p-5 bg-white rounded-2xl border-2 transition-all text-left',
                    selectedSale?.id === sale.id
                      ? 'border-accent shadow-lg shadow-accent/10'
                      : 'border-surface-100 hover:border-surface-200 hover:shadow-md'
                  )}
                >
                  {/* Receipt Icon */}
                  <div className={clsx(
                    'w-12 h-12 rounded-xl flex items-center justify-center',
                    sale.status === 'completed' ? 'bg-gradient-to-br from-accent-100 to-accent-200' :
                    sale.status === 'refunded' ? 'bg-gradient-to-br from-warning-100 to-warning-200' :
                    'bg-surface-100'
                  )}>
                    {sale.status === 'completed' ? <Check size={22} className="text-accent" /> :
                     sale.status === 'refunded' ? <RefreshCw size={22} className="text-warning" /> :
                     <Ban size={22} className="text-surface-400" />}
                  </div>

                  {/* Sale Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-surface-900">
                        {sale.receiptNumber || `#${sale.id.slice(-8).toUpperCase()}`}
                      </span>
                      <StatusBadge status={sale.status} />
                    </div>
                    <div className="flex items-center gap-3 text-sm text-surface-500">
                      <span>{sale.items.length} items</span>
                      <span>•</span>
                      <span>{sale.customerName || 'Walk-in'}</span>
                    </div>
                  </div>

                  {/* Amount & Time */}
                  <div className="text-right">
                    <p className={clsx(
                      'text-lg font-bold tabular-nums',
                      sale.status === 'refunded' ? 'text-warning line-through' : 'text-surface-900'
                    )}>
                      {formatCurrency(sale.total)}
                    </p>
                    <p className="text-xs text-surface-400 flex items-center gap-1 justify-end">
                      <Clock size={12} />
                      {formatRelativeTime(sale.completedAt || sale.createdAt)}
                    </p>
                  </div>

                  <ChevronRight size={20} className="text-surface-300" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sale Detail Panel */}
      {selectedSale && (
        <div className="w-[440px] bg-white border-l border-surface-200 flex flex-col animate-slide-up shadow-2xl">
          {/* Header */}
          <div className="px-6 py-5 border-b border-surface-100 flex items-center justify-between bg-gradient-to-r from-surface-50 to-white">
            <div>
              <h2 className="font-bold text-lg text-surface-900">Sale Details</h2>
              <p className="text-sm text-surface-500 font-mono">
                {selectedSale.receiptNumber || `#${selectedSale.id.slice(-8).toUpperCase()}`}
              </p>
            </div>
            <button
              onClick={() => setSelectedSale(null)}
              className="p-2.5 rounded-xl hover:bg-surface-100 text-surface-400 hover:text-surface-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Status & Date */}
            <div className="flex items-center justify-between p-4 bg-surface-50 rounded-xl">
              <StatusBadge status={selectedSale.status} />
              <span className="text-sm text-surface-500 font-medium">
                {formatDateTime(selectedSale.completedAt || selectedSale.createdAt)}
              </span>
            </div>

            {/* Customer */}
            {selectedSale.customerName && (
              <div className="flex items-center gap-3 p-4 bg-surface-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center">
                  <User size={18} className="text-accent" />
                </div>
                <div>
                  <p className="text-xs text-surface-500">Customer</p>
                  <p className="font-semibold text-surface-900">{selectedSale.customerName}</p>
                </div>
              </div>
            )}

            {/* Refund Reason */}
            {selectedSale.status === 'refunded' && selectedSale.refundReason && (
              <div className="p-4 bg-warning-50 rounded-xl border border-warning-100">
                <p className="text-xs font-semibold text-warning-600 mb-1">Refund Reason</p>
                <p className="text-sm text-warning-800">{selectedSale.refundReason}</p>
              </div>
            )}

            {/* Items */}
            <div>
              <h3 className="text-sm font-bold text-surface-700 mb-3">Items</h3>
              <div className="space-y-3">
                {selectedSale.items.map((item, idx) => (
                  <div key={idx} className="flex items-start justify-between p-3 bg-surface-50 rounded-xl">
                    <div>
                      <p className="font-semibold text-surface-900">{item.product.name}</p>
                      <p className="text-sm text-surface-500">
                        {item.quantity} × {formatCurrency(item.product.price)}
                        {item.discount > 0 && (
                          <span className="ml-2 text-accent font-medium">(-{item.discount}%)</span>
                        )}
                      </p>
                    </div>
                    <p className="font-bold tabular-nums text-surface-900">
                      {formatCurrency(
                        item.product.price * item.quantity * (1 - item.discount / 100)
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="pt-4 border-t border-dashed border-surface-200 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-surface-500">Subtotal</span>
                <span className="font-medium tabular-nums">{formatCurrency(selectedSale.subtotal)}</span>
              </div>
              {selectedSale.discount > 0 && (
                <div className="flex justify-between text-sm text-accent">
                  <span className="font-medium">Discount</span>
                  <span className="font-medium tabular-nums">-{formatCurrency(selectedSale.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-surface-500">Tax (16%)</span>
                <span className="font-medium tabular-nums">{formatCurrency(selectedSale.tax)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-surface-200">
                <span className="text-lg font-bold">Total</span>
                <span className="text-xl font-bold tabular-nums text-accent">{formatCurrency(selectedSale.total)}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="flex items-center gap-3 p-4 bg-surface-50 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                {selectedSale.payments[0]?.method === 'card' 
                  ? <CreditCard size={18} className="text-blue-600" />
                  : <Banknote size={18} className="text-green-600" />
                }
              </div>
              <div>
                <p className="text-xs text-surface-500">Payment Method</p>
                <p className="font-semibold text-surface-900 capitalize">
                  {selectedSale.payments.map(p => p.method).join(' + ') || 'Cash'}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          {selectedSale.status === 'completed' && (
            <div className="p-5 border-t border-surface-200 bg-surface-50">
              <button
                onClick={() => setShowRefundModal(true)}
                className="btn-secondary w-full py-3.5"
              >
                <RefreshCw size={18} />
                <span>Issue Refund</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Refund Modal */}
      <Modal
        isOpen={showRefundModal}
        onClose={() => {
          setShowRefundModal(false);
          setRefundReason('');
        }}
        title="Issue Refund"
        size="sm"
      >
        <div className="space-y-5">
          <p className="text-surface-600">
            Are you sure you want to refund this sale of{' '}
            <strong className="text-surface-900">{formatCurrency(selectedSale?.total || 0)}</strong>?
          </p>
          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-2">
              Reason for refund
            </label>
            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="Enter the reason for this refund..."
              className="input min-h-[120px] resize-none"
              autoFocus
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setShowRefundModal(false);
                setRefundReason('');
              }}
              className="btn-secondary flex-1 py-3"
            >
              Cancel
            </button>
            <button
              onClick={handleRefund}
              disabled={!refundReason.trim()}
              className="btn-danger flex-1 py-3"
            >
              Confirm Refund
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
