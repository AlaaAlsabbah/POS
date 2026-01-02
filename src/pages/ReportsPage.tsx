import { useMemo } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Calendar,
  Package,
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { usePOSStore } from '../store';
import { formatCurrency, formatNumber } from '../utils/format';
import { clsx } from 'clsx';

export function ReportsPage() {
  const { sales } = usePOSStore();

  const stats = useMemo(() => {
    const completedSales = sales.filter(s => s.status === 'completed');
    const refundedSales = sales.filter(s => s.status === 'refunded');

    // Time-based calculations
    const now = new Date();
    const today = now.toDateString();
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay());

    const todaySales = completedSales.filter(
      s => new Date(s.completedAt!).toDateString() === today
    );

    const thisWeekSales = completedSales.filter(
      s => new Date(s.completedAt!) >= thisWeekStart
    );

    // Product performance
    const productSales: Record<string, { count: number; revenue: number; name: string }> = {};
    completedSales.forEach(sale => {
      sale.items.forEach(item => {
        const id = item.product.id;
        if (!productSales[id]) {
          productSales[id] = { count: 0, revenue: 0, name: item.product.name };
        }
        productSales[id].count += item.quantity;
        productSales[id].revenue += item.product.price * item.quantity * (1 - item.discount / 100);
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Category breakdown
    const categoryRevenue: Record<string, number> = {};
    completedSales.forEach(sale => {
      sale.items.forEach(item => {
        const cat = item.product.category;
        if (!categoryRevenue[cat]) categoryRevenue[cat] = 0;
        categoryRevenue[cat] += item.product.price * item.quantity * (1 - item.discount / 100);
      });
    });

    const categoryData = Object.entries(categoryRevenue)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));

    // Payment methods
    const paymentMethods: Record<string, number> = { cash: 0, card: 0 };
    completedSales.forEach(sale => {
      sale.payments.forEach(p => {
        paymentMethods[p.method] = (paymentMethods[p.method] || 0) + p.amount;
      });
    });

    return {
      totalRevenue: completedSales.reduce((sum, s) => sum + s.total, 0),
      totalTransactions: completedSales.length,
      averageTransaction: completedSales.length > 0
        ? completedSales.reduce((sum, s) => sum + s.total, 0) / completedSales.length
        : 0,
      todayRevenue: todaySales.reduce((sum, s) => sum + s.total, 0),
      todayTransactions: todaySales.length,
      weekRevenue: thisWeekSales.reduce((sum, s) => sum + s.total, 0),
      weekTransactions: thisWeekSales.length,
      refundAmount: refundedSales.reduce((sum, s) => sum + s.total, 0),
      refundCount: refundedSales.length,
      topProducts,
      categoryData,
      paymentMethods,
      itemsSold: completedSales.reduce(
        (sum, s) => sum + s.items.reduce((isum, i) => isum + i.quantity, 0),
        0
      ),
    };
  }, [sales]);

  const totalPayments = stats.paymentMethods.cash + stats.paymentMethods.card;
  const cashPercent = totalPayments > 0 ? (stats.paymentMethods.cash / totalPayments) * 100 : 0;
  const cardPercent = totalPayments > 0 ? (stats.paymentMethods.card / totalPayments) * 100 : 0;

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-surface-50 to-surface-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-surface-900">Reports & Analytics</h1>
            <p className="text-surface-500">Overview of your store performance</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-surface-200 text-sm text-surface-600">
            <Calendar size={16} />
            <span>All Time</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-5">
          <MetricCard
            icon={DollarSign}
            label="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            subValue={`${formatNumber(stats.totalTransactions)} transactions`}
            color="accent"
            trend={12}
          />
          <MetricCard
            icon={TrendingUp}
            label="Today's Sales"
            value={formatCurrency(stats.todayRevenue)}
            subValue={`${stats.todayTransactions} sales`}
            color="blue"
            trend={8}
          />
          <MetricCard
            icon={ShoppingBag}
            label="Avg. Transaction"
            value={formatCurrency(stats.averageTransaction)}
            subValue={`${formatNumber(stats.itemsSold)} items sold`}
            color="purple"
          />
          <MetricCard
            icon={Calendar}
            label="This Week"
            value={formatCurrency(stats.weekRevenue)}
            subValue={`${stats.weekTransactions} transactions`}
            color="orange"
            trend={-3}
          />
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Top Products */}
          <div className="col-span-2 bg-white rounded-2xl p-6 border border-surface-100 shadow-soft">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-100 to-accent-200 flex items-center justify-center">
                <Package size={20} className="text-accent" />
              </div>
              <h2 className="text-lg font-bold text-surface-900">Top Products</h2>
            </div>
            {stats.topProducts.length === 0 ? (
              <p className="text-surface-500 text-sm py-12 text-center">
                No sales data yet. Complete some sales to see your top products.
              </p>
            ) : (
              <div className="space-y-4">
                {stats.topProducts.map((product, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4"
                  >
                    <span className="w-8 h-8 rounded-full bg-gradient-to-br from-surface-100 to-surface-200 flex items-center justify-center text-sm font-bold text-surface-500">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-surface-900">{product.name}</span>
                        <span className="font-bold text-surface-900">
                          {formatCurrency(product.revenue)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2.5 bg-surface-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-accent to-accent-600 rounded-full"
                            style={{
                              width: `${(product.revenue / stats.topProducts[0].revenue) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium text-surface-500 w-16 text-right">
                          {product.count} sold
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-2xl p-6 border border-surface-100 shadow-soft">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <PieChartIcon size={20} className="text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-surface-900">Payment Split</h2>
            </div>
            {totalPayments === 0 ? (
              <p className="text-surface-500 text-sm py-12 text-center">
                No payment data yet
              </p>
            ) : (
              <div className="space-y-5">
                {/* Visual Bar */}
                <div className="h-5 rounded-full overflow-hidden flex shadow-inner">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-500 h-full"
                    style={{ width: `${cashPercent}%` }}
                  />
                  <div
                    className="bg-gradient-to-r from-blue-400 to-blue-500 h-full"
                    style={{ width: `${cardPercent}%` }}
                  />
                </div>

                {/* Legend */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-surface-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-400 to-green-500" />
                      <span className="font-medium text-surface-700">Cash</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-surface-900">{formatCurrency(stats.paymentMethods.cash)}</p>
                      <p className="text-xs text-surface-500">{cashPercent.toFixed(0)}%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-surface-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-400 to-blue-500" />
                      <span className="font-medium text-surface-700">Card</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-surface-900">{formatCurrency(stats.paymentMethods.card)}</p>
                      <p className="text-xs text-surface-500">{cardPercent.toFixed(0)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-surface-100 shadow-soft">
          <h2 className="text-lg font-bold text-surface-900 mb-5">Sales by Category</h2>
          {stats.categoryData.length === 0 ? (
            <p className="text-surface-500 text-sm py-12 text-center">
              No category data yet
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {stats.categoryData.map((cat) => (
                <div key={cat.name} className="p-5 bg-gradient-to-br from-surface-50 to-surface-100 rounded-2xl">
                  <p className="text-sm font-medium text-surface-500 mb-2">{cat.name}</p>
                  <p className="text-2xl font-bold text-surface-900">
                    {formatCurrency(cat.value)}
                  </p>
                  <p className="text-xs font-medium text-accent mt-1">
                    {((cat.value / stats.totalRevenue) * 100).toFixed(1)}% of total
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  subValue: string;
  color: 'accent' | 'blue' | 'purple' | 'orange';
  trend?: number;
}

function MetricCard({ icon: Icon, label, value, subValue, color, trend }: MetricCardProps) {
  const colorClasses = {
    accent: 'from-accent-100 to-accent-200',
    blue: 'from-blue-100 to-blue-200',
    purple: 'from-purple-100 to-purple-200',
    orange: 'from-orange-100 to-orange-200',
  };

  const iconClasses = {
    accent: 'text-accent',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-surface-100 shadow-soft">
      <div className="flex items-start justify-between mb-4">
        <div
          className={clsx(
            'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center',
            colorClasses[color]
          )}
        >
          <Icon size={22} className={iconClasses[color]} />
        </div>
        {trend !== undefined && (
          <div className={clsx(
            'flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full',
            trend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          )}>
            {trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-sm font-medium text-surface-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-surface-900 mb-1">{value}</p>
      <p className="text-sm text-surface-400">{subValue}</p>
    </div>
  );
}
