import { TrendingUp, Users, IndianRupee, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface DashboardSummaryProps {
  stats: {
    total: number;
    paid: number;
    notPaid: number;
    totalFees: number;
    paidFees: number;
  };
}

export function DashboardSummary({ stats }: DashboardSummaryProps) {
  const pendingFees = stats.totalFees - stats.paidFees;
  const collectionRate = stats.totalFees > 0 ? Math.round((stats.paidFees / stats.totalFees) * 100) : 0;
  
  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount}`;
  };

  return (
    <div className="card-elevated p-6 mb-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold font-display text-card-foreground">Quick Overview</h2>
          <p className="text-sm text-muted-foreground">Your institute at a glance</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-primary">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-xl border border-emerald-500/20">
          <div className="flex items-center justify-between mb-3">
            <IndianRupee className="w-5 h-5 text-emerald-600" />
            <div className="flex items-center gap-1 text-xs text-emerald-600">
              <ArrowUpRight className="w-3 h-3" />
              <span>{collectionRate}%</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-card-foreground font-display">{formatCurrency(stats.paidFees)}</p>
          <p className="text-xs text-muted-foreground mt-1">Collected</p>
        </div>

        {/* Pending */}
        <div className="p-4 bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-xl border border-amber-500/20">
          <div className="flex items-center justify-between mb-3">
            <Clock className="w-5 h-5 text-amber-600" />
            <div className="flex items-center gap-1 text-xs text-amber-600">
              <ArrowDownRight className="w-3 h-3" />
              <span>{100 - collectionRate}%</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-card-foreground font-display">{formatCurrency(pendingFees)}</p>
          <p className="text-xs text-muted-foreground mt-1">Pending</p>
        </div>

        {/* Active Students */}
        <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl border border-blue-500/20">
          <div className="flex items-center justify-between mb-3">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-card-foreground font-display">{stats.total}</p>
          <p className="text-xs text-muted-foreground mt-1">Active Students</p>
        </div>

        {/* Collection Rate */}
        <div className="p-4 bg-gradient-to-br from-violet-500/10 to-violet-600/5 rounded-xl border border-violet-500/20">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-5 h-5 text-violet-600" />
          </div>
          <p className="text-2xl font-bold text-card-foreground font-display">{collectionRate}%</p>
          <p className="text-xs text-muted-foreground mt-1">Collection Rate</p>
          <div className="mt-2 h-1.5 bg-violet-200 dark:bg-violet-900/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${collectionRate}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
