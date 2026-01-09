import { Users, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

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
      gradient: 'from-blue-500 to-cyan-500',
      glowColor: 'blue',
      borderColor: 'border-blue-500/20 dark:border-blue-400/30',
      iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      delay: '0s',
    },
    {
      icon: CheckCircle,
      value: stats.paid,
      label: 'Fees Paid',
      sublabel: formatCurrency(stats.paidFees),
      gradient: 'from-emerald-500 to-teal-500',
      glowColor: 'emerald',
      borderColor: 'border-emerald-500/20 dark:border-emerald-400/30',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-500',
      delay: '0.1s',
    },
    {
      icon: XCircle,
      value: stats.notPaid,
      label: 'Fees Pending',
      sublabel: formatCurrency(pendingFees),
      gradient: 'from-rose-500 to-pink-500',
      glowColor: 'rose',
      borderColor: 'border-rose-500/20 dark:border-rose-400/30',
      iconBg: 'bg-gradient-to-br from-rose-500 to-pink-500',
      delay: '0.2s',
    },
    {
      icon: TrendingUp,
      value: `${collectionRate}%`,
      label: 'Collection Rate',
      sublabel: 'Success ratio',
      gradient: 'from-violet-500 to-purple-500',
      glowColor: 'violet',
      borderColor: 'border-violet-500/20 dark:border-violet-400/30',
      iconBg: 'bg-gradient-to-br from-violet-500 to-purple-500',
      delay: '0.3s',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-8">
      {cards.map((card, index) => (
        <div 
          key={card.label}
          className={`stats-card group ${card.borderColor}`}
          style={{ 
            animationDelay: card.delay,
            animation: 'fadeIn 0.5s ease-out forwards, slideUp 0.5s ease-out forwards'
          }}
        >
          {/* Glow effect for dark mode */}
          <div className={`absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br ${card.gradient} opacity-0 dark:opacity-20 rounded-full blur-2xl transition-opacity duration-500 group-hover:opacity-10 dark:group-hover:opacity-30`} />
          
          {/* Subtle shine */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
          
          <div className="relative z-10">
            {/* Icon with glow */}
            <div className={`icon-glow inline-flex p-3 rounded-xl ${card.iconBg} shadow-lg mb-4 transition-transform duration-300 group-hover:scale-110`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            
            {/* Value */}
            <p className="number-premium">
              {card.value}
            </p>
            
            {/* Label */}
            <p className="text-sm font-semibold text-card-foreground/80 mt-1.5">
              {card.label}
            </p>
            
            {/* Sublabel */}
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">
              {card.sublabel}
            </p>
          </div>

          {/* Bottom accent line */}
          <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-2xl`} />
        </div>
      ))}
    </div>
  );
}
