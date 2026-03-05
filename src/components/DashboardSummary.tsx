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
    <div className="glass-premium card-elevated p-4 sm:p-6 mb-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h2 className="text-base sm:text-lg font-semibold font-display text-card-foreground flex items-center gap-2">
            Quick Overview
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold dark:text-gold" />
          </h2>
          <p className="text-[11px] sm:text-sm text-muted-foreground">Your institute at a glance</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full border border-emerald-500/20">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400">Live</span>
        </div>
      </div>

      {/* Cards Grid - 2x2 on mobile */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        {/* Collected */}
        <div className="group p-3 sm:p-4 bg-gradient-to-br from-emerald-500/8 to-emerald-600/3 dark:from-emerald-500/12 dark:to-emerald-600/5 rounded-xl border border-emerald-500/15 dark:border-emerald-400/20 transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20">
              <IndianRupee className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex items-center gap-0.5 text-[10px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
              <ArrowUpRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span>{collectionRate}%</span>
            </div>
          </div>
          <p className="number-premium text-lg sm:text-2xl">{formatCurrency(stats.paidFees)}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 font-medium">Collected</p>
        </div>

        {/* Pending */}
        <div className="group p-3 sm:p-4 bg-gradient-to-br from-amber-500/8 to-amber-600/3 dark:from-amber-500/12 dark:to-amber-600/5 rounded-xl border border-amber-500/15 dark:border-amber-400/20 transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-amber-500/10 dark:bg-amber-500/20">
              <Clock className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex items-center gap-0.5 text-[10px] sm:text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
              <ArrowDownRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span>{100 - collectionRate}%</span>
            </div>
          </div>
          <p className="number-premium text-lg sm:text-2xl">{formatCurrency(pendingFees)}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 font-medium">Pending</p>
        </div>

        {/* Active Students */}
        <div className="group p-3 sm:p-4 bg-gradient-to-br from-blue-500/8 to-blue-600/3 dark:from-blue-500/12 dark:to-blue-600/5 rounded-xl border border-blue-500/15 dark:border-blue-400/20 transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
              <Users className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="number-premium text-lg sm:text-2xl">{stats.total}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 font-medium">Active Students</p>
        </div>

        {/* Collection Rate */}
        <div className="group p-3 sm:p-4 bg-gradient-to-br from-violet-500/8 to-violet-600/3 dark:from-violet-500/12 dark:to-violet-600/5 rounded-xl border border-violet-500/15 dark:border-violet-400/20 transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-violet-500/10 dark:bg-violet-500/20">
              <TrendingUp className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-violet-600 dark:text-violet-400" />
            </div>
          </div>
          <p className="number-premium text-lg sm:text-2xl">{collectionRate}%</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 font-medium">Collection Rate</p>
          <div className="mt-2 sm:mt-3 h-1.5 sm:h-2 bg-violet-200/50 dark:bg-violet-900/40 rounded-full overflow-hidden">
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
