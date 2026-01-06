import { Users, CheckCircle, XCircle, TrendingUp, IndianRupee, Wallet } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    total: number;
    paid: number;
    notPaid: number;
    totalFees: number;
    paidFees: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Collection rate based on money collected, not student count
  const collectionRate = stats.totalFees > 0 
    ? Math.round((stats.paidFees / stats.totalFees) * 100) 
    : 0;

  const pendingFees = stats.totalFees - stats.paidFees;

  const cards = [
    {
      icon: Users,
      value: stats.total,
      label: 'Total Students',
      sublabel: 'Enrolled',
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-500/10 to-blue-600/10',
      borderColor: 'border-blue-500/20',
      delay: '0s',
    },
    {
      icon: CheckCircle,
      value: stats.paid,
      label: 'Fees Paid',
      sublabel: formatCurrency(stats.paidFees),
      gradient: 'from-emerald-500 to-emerald-600',
      bgGradient: 'from-emerald-500/10 to-emerald-600/10',
      borderColor: 'border-emerald-500/20',
      delay: '0.1s',
    },
    {
      icon: XCircle,
      value: stats.notPaid,
      label: 'Fees Pending',
      sublabel: formatCurrency(pendingFees),
      gradient: 'from-rose-500 to-rose-600',
      bgGradient: 'from-rose-500/10 to-rose-600/10',
      borderColor: 'border-rose-500/20',
      delay: '0.2s',
    },
    {
      icon: TrendingUp,
      value: `${collectionRate}%`,
      label: 'Collection Rate',
      sublabel: 'Success ratio',
      gradient: 'from-violet-500 to-purple-600',
      bgGradient: 'from-violet-500/10 to-purple-600/10',
      borderColor: 'border-violet-500/20',
      delay: '0.3s',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {cards.map((card) => (
        <div 
          key={card.label}
          className={`relative overflow-hidden bg-gradient-to-br ${card.bgGradient} rounded-2xl border ${card.borderColor} p-5 animate-fade-in card-elevated-hover`}
          style={{ animationDelay: card.delay }}
        >
          {/* Decorative circle */}
          <div className={`absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br ${card.gradient} opacity-10 rounded-full blur-xl`} />
          
          <div className="relative z-10">
            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg mb-4`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-3xl font-bold text-card-foreground font-display tracking-tight">
              {card.value}
            </p>
            <p className="text-sm font-semibold text-card-foreground/80 mt-1">
              {card.label}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {card.sublabel}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
