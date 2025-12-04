import { Users, CheckCircle, XCircle, IndianRupee } from 'lucide-react';

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

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-card rounded-lg shadow-card p-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-card-foreground">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Students</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-card p-4 animate-fade-in" style={{ animationDelay: '0.05s' }}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-success/10 rounded-lg">
            <CheckCircle className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-card-foreground">{stats.paid}</p>
            <p className="text-sm text-muted-foreground">Fees Paid</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-card p-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-destructive/10 rounded-lg">
            <XCircle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <p className="text-2xl font-bold text-card-foreground">{stats.notPaid}</p>
            <p className="text-sm text-muted-foreground">Fees Pending</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-card p-4 animate-fade-in" style={{ animationDelay: '0.15s' }}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg">
            <IndianRupee className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-2xl font-bold text-card-foreground">{formatCurrency(stats.paidFees)}</p>
            <p className="text-sm text-muted-foreground">Collected</p>
          </div>
        </div>
      </div>
    </div>
  );
}
