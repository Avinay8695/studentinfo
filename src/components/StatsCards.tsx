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
      borderColor: 'border-blue-500/15 dark:border-blue-400/20',
      iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      delay: '0s',
    },
    {
      icon: CheckCircle,
      value: stats.paid,
      label: 'Fees Paid',
      sublabel: formatCurrency(stats.paidFees),
      gradient: 'from-emerald-500 to-teal-500',
      borderColor: 'border-emerald-500/15 dark:border-emerald-400/20',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-500',
      delay: '0.1s',
    },
    {
      icon: XCircle,
      value: stats.notPaid,
      label: 'Fees Pending',
      sublabel: formatCurrency(pendingFees),
      gradient: 'from-rose-500 to-pink-500',
      borderColor: 'border-rose-500/15 dark:border-rose-400/20',
      iconBg: 'bg-gradient-to-br from-rose-500 to-pink-500',
      delay: '0.2s',
    },
    {
      icon: TrendingUp,
      value: `${collectionRate}%`,
      label: 'Collection Rate',
      sublabel: 'Success ratio',
      gradient: 'from-violet-500 to-purple-500',
      borderColor: 'border-violet-500/15 dark:border-violet-400/20',
      iconBg: 'bg-gradient-to-br from-violet-500 to-purple-500',
      delay: '0.3s',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5 mb-6 sm:mb-8">
      {cards.map((card) => (
        <div 
          key={card.label}
          className={`stats-card group ${card.borderColor}`}
          style={{ 
            animationDelay: card.delay,
            animation: 'fadeIn 0.5s ease-out forwards, slideUp 0.5s ease-out forwards'
          }}
        >
          {/* Glow effect */}
          <div className={`absolute -top-8 -right-8 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br ${card.gradient} opacity-0 dark:opacity-15 rounded-full blur-2xl transition-opacity duration-500 group-hover:opacity-10 dark:group-hover:opacity-25`} />
          
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
          
          <div className="relative z-10">
            <div className={`icon-glow inline-flex p-2.5 sm:p-3 rounded-xl ${card.iconBg} shadow-lg mb-3 sm:mb-4 transition-transform duration-300 group-hover:scale-110`}>
              <card.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            
            <p className="number-premium text-xl sm:text-3xl">
              {card.value}
            </p>
            
            <p className="text-xs sm:text-sm font-semibold text-card-foreground/80 mt-1 sm:mt-1.5">
              {card.label}
            </p>
            
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 font-medium truncate">
              {card.sublabel}
            </p>
          </div>

          <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-2xl`} />
        </div>
      ))}
    </div>
  );
}
