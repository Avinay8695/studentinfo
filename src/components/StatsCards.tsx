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

  const collectionRate = stats.total > 0 
    ? Math.round((stats.paid / stats.total) * 100) 
    : 0;

  const cards = [
    {
      icon: Users,
      value: stats.total,
      label: 'Total Students',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      delay: '0s',
    },
    {
      icon: CheckCircle,
      value: stats.paid,
      label: 'Fees Paid',
      iconBg: 'bg-success/10',
      iconColor: 'text-success',
      delay: '0.1s',
    },
    {
      icon: XCircle,
      value: stats.notPaid,
      label: 'Fees Pending',
      iconBg: 'bg-destructive/10',
      iconColor: 'text-destructive',
      delay: '0.2s',
    },
    {
      icon: TrendingUp,
      value: `${collectionRate}%`,
      label: 'Collection Rate',
      iconBg: 'bg-accent/10',
      iconColor: 'text-accent',
      delay: '0.3s',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, index) => (
        <div 
          key={card.label}
          className="card-elevated card-elevated-hover p-5 animate-fade-in"
          style={{ animationDelay: card.delay }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-3xl font-bold text-card-foreground font-display">
                {card.value}
              </p>
              <p className="text-sm text-muted-foreground mt-1 font-medium">
                {card.label}
              </p>
            </div>
            <div className={`p-2.5 ${card.iconBg} rounded-xl`}>
              <card.icon className={`w-5 h-5 ${card.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
