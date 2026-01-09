import { TrendingUp, Users, IndianRupee, Clock, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';

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
    <div className="glass-premium card-elevated p-6 mb-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold font-display text-card-foreground flex items-center gap-2">
            Quick Overview
            <Sparkles className="w-4 h-4 text-gold dark:text-gold" />
          </h2>
          <p className="text-sm text-muted-foreground">Your institute at a glance</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full border border-emerald-500/20">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="group p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 dark:from-emerald-500/15 dark:to-emerald-600/5 rounded-xl border border-emerald-500/20 dark:border-emerald-400/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg dark:hover:shadow-emerald-500/10">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20">
              <IndianRupee className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3" />
              <span>{collectionRate}%</span>
            </div>
          </div>
          <p className="number-premium text-2xl">{formatCurrency(stats.paidFees)}</p>
          <p className="text-xs text-muted-foreground mt-1 font-medium">Collected</p>
        </div>

        {/* Pending */}
        <div className="group p-4 bg-gradient-to-br from-amber-500/10 to-amber-600/5 dark:from-amber-500/15 dark:to-amber-600/5 rounded-xl border border-amber-500/20 dark:border-amber-400/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg dark:hover:shadow-amber-500/10">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-amber-500/10 dark:bg-amber-500/20">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full">
              <ArrowDownRight className="w-3 h-3" />
              <span>{100 - collectionRate}%</span>
            </div>
          </div>
          <p className="number-premium text-2xl">{formatCurrency(pendingFees)}</p>
          <p className="text-xs text-muted-foreground mt-1 font-medium">Pending</p>
        </div>

        {/* Active Students */}
        <div className="group p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 dark:from-blue-500/15 dark:to-blue-600/5 rounded-xl border border-blue-500/20 dark:border-blue-400/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg dark:hover:shadow-blue-500/10">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="number-premium text-2xl">{stats.total}</p>
          <p className="text-xs text-muted-foreground mt-1 font-medium">Active Students</p>
        </div>

        {/* Collection Rate */}
        <div className="group p-4 bg-gradient-to-br from-violet-500/10 to-violet-600/5 dark:from-violet-500/15 dark:to-violet-600/5 rounded-xl border border-violet-500/20 dark:border-violet-400/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg dark:hover:shadow-violet-500/10">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-violet-500/10 dark:bg-violet-500/20">
              <TrendingUp className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
          </div>
          <p className="number-premium text-2xl">{collectionRate}%</p>
          <p className="text-xs text-muted-foreground mt-1 font-medium">Collection Rate</p>
          <div className="mt-3 h-2 bg-violet-200/50 dark:bg-violet-900/40 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-700 ease-out relative overflow-hidden"
              style={{ width: `${collectionRate}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
