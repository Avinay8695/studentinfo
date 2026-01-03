import { useState, useMemo } from 'react';
import { Student } from '@/types/student';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CalendarDays, 
  TrendingUp, 
  IndianRupee, 
  Users, 
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  BarChart3
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, isWithinInterval, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface DateRangeAnalyticsProps {
  students: Student[];
}

type DatePreset = 'this_month' | 'last_month' | 'last_3_months' | 'last_6_months' | 'this_year' | 'custom';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function DateRangeAnalytics({ students }: DateRangeAnalyticsProps) {
  const [datePreset, setDatePreset] = useState<DatePreset>('this_month');
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);

  // Calculate date range based on preset or custom
  const dateRange = useMemo(() => {
    const today = new Date();
    
    switch (datePreset) {
      case 'this_month':
        return { start: startOfMonth(today), end: endOfMonth(today) };
      case 'last_month':
        const lastMonth = subMonths(today, 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
      case 'last_3_months':
        return { start: startOfMonth(subMonths(today, 2)), end: endOfMonth(today) };
      case 'last_6_months':
        return { start: startOfMonth(subMonths(today, 5)), end: endOfMonth(today) };
      case 'this_year':
        return { start: startOfYear(today), end: endOfYear(today) };
      case 'custom':
        return {
          start: customStartDate || startOfMonth(today),
          end: customEndDate || endOfMonth(today),
        };
      default:
        return { start: startOfMonth(today), end: endOfMonth(today) };
    }
  }, [datePreset, customStartDate, customEndDate]);

  // Filter payments within date range
  const analytics = useMemo(() => {
    const { start, end } = dateRange;
    
    let paymentsInRange: { isPaid: boolean; amount: number; month: number; year: number; studentName: string }[] = [];
    let enrollmentsInRange = 0;
    
    students.forEach(student => {
      // Check enrollments in range
      const enrollDate = parseISO(student.enrollmentDate);
      if (isWithinInterval(enrollDate, { start, end })) {
        enrollmentsInRange++;
      }
      
      // Check payments in range
      student.monthlyPayments?.forEach(payment => {
        const paymentDate = new Date(payment.year, payment.month, 1);
        if (isWithinInterval(paymentDate, { start, end })) {
          paymentsInRange.push({
            ...payment,
            studentName: student.fullName,
          });
        }
      });
    });

    const totalPaymentsExpected = paymentsInRange.reduce((sum, p) => sum + p.amount, 0);
    const totalPaymentsCollected = paymentsInRange.filter(p => p.isPaid).reduce((sum, p) => sum + p.amount, 0);
    const totalPaymentsPending = paymentsInRange.filter(p => !p.isPaid).reduce((sum, p) => sum + p.amount, 0);
    const paidCount = paymentsInRange.filter(p => p.isPaid).length;
    const unpaidCount = paymentsInRange.filter(p => !p.isPaid).length;
    const collectionRate = totalPaymentsExpected > 0 
      ? Math.round((totalPaymentsCollected / totalPaymentsExpected) * 100) 
      : 0;

    // Monthly breakdown for chart
    const monthlyData: { [key: string]: { collected: number; pending: number; month: string } } = {};
    paymentsInRange.forEach(payment => {
      const key = `${payment.year}-${payment.month}`;
      if (!monthlyData[key]) {
        monthlyData[key] = {
          month: `${MONTH_NAMES[payment.month]} ${payment.year.toString().slice(-2)}`,
          collected: 0,
          pending: 0,
        };
      }
      if (payment.isPaid) {
        monthlyData[key].collected += payment.amount;
      } else {
        monthlyData[key].pending += payment.amount;
      }
    });

    const chartData = Object.values(monthlyData).sort((a, b) => {
      const [aMonth, aYear] = a.month.split(' ');
      const [bMonth, bYear] = b.month.split(' ');
      if (aYear !== bYear) return parseInt(aYear) - parseInt(bYear);
      return MONTH_NAMES.indexOf(aMonth) - MONTH_NAMES.indexOf(bMonth);
    });

    return {
      totalPaymentsExpected,
      totalPaymentsCollected,
      totalPaymentsPending,
      paidCount,
      unpaidCount,
      collectionRate,
      enrollmentsInRange,
      chartData,
      paymentsInRange,
    };
  }, [students, dateRange]);

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount}`;
  };

  const pieData = [
    { name: 'Collected', value: analytics.totalPaymentsCollected, color: 'hsl(var(--chart-2))' },
    { name: 'Pending', value: analytics.totalPaymentsPending, color: 'hsl(var(--chart-5))' },
  ].filter(d => d.value > 0);

  const chartConfig = {
    collected: {
      label: "Collected",
      color: "hsl(var(--chart-2))",
    },
    pending: {
      label: "Pending",
      color: "hsl(var(--chart-5))",
    },
  };

  return (
    <Card className="p-6 mb-6 animate-fade-in card-elevated">
      {/* Header with Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold font-display text-card-foreground">Performance Analytics</h2>
            <p className="text-sm text-muted-foreground">
              {format(dateRange.start, 'dd MMM yyyy')} - {format(dateRange.end, 'dd MMM yyyy')}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={datePreset} onValueChange={(value: DatePreset) => setDatePreset(value)}>
            <SelectTrigger className="w-[160px] bg-background">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="last_3_months">Last 3 Months</SelectItem>
              <SelectItem value="last_6_months">Last 6 Months</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          {datePreset === 'custom' && (
            <div className="flex items-center gap-2">
              <Popover open={isStartOpen} onOpenChange={setIsStartOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <CalendarDays className="w-4 h-4" />
                    {customStartDate ? format(customStartDate, 'dd MMM') : 'Start'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={customStartDate}
                    onSelect={(date) => {
                      setCustomStartDate(date);
                      setIsStartOpen(false);
                    }}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <span className="text-muted-foreground">to</span>
              <Popover open={isEndOpen} onOpenChange={setIsEndOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <CalendarDays className="w-4 h-4" />
                    {customEndDate ? format(customEndDate, 'dd MMM') : 'End'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={customEndDate}
                    onSelect={(date) => {
                      setCustomEndDate(date);
                      setIsEndOpen(false);
                    }}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {/* Collected */}
        <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-xl border border-emerald-500/20">
          <div className="flex items-center justify-between mb-2">
            <IndianRupee className="w-5 h-5 text-emerald-600" />
            <div className="flex items-center gap-1 text-xs text-emerald-600">
              <ArrowUpRight className="w-3 h-3" />
              <span>{analytics.collectionRate}%</span>
            </div>
          </div>
          <p className="text-xl font-bold text-card-foreground font-display">{formatCurrency(analytics.totalPaymentsCollected)}</p>
          <p className="text-xs text-muted-foreground">Collected</p>
        </div>

        {/* Pending */}
        <div className="p-4 bg-gradient-to-br from-rose-500/10 to-rose-600/5 rounded-xl border border-rose-500/20">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <div className="flex items-center gap-1 text-xs text-rose-600">
              <ArrowDownRight className="w-3 h-3" />
              <span>{100 - analytics.collectionRate}%</span>
            </div>
          </div>
          <p className="text-xl font-bold text-card-foreground font-display">{formatCurrency(analytics.totalPaymentsPending)}</p>
          <p className="text-xs text-muted-foreground">Pending</p>
        </div>

        {/* Paid Count */}
        <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl border border-blue-500/20">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-xl font-bold text-card-foreground font-display">{analytics.paidCount}</p>
          <p className="text-xs text-muted-foreground">Payments Received</p>
        </div>

        {/* Unpaid Count */}
        <div className="p-4 bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-xl border border-amber-500/20">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-xl font-bold text-card-foreground font-display">{analytics.unpaidCount}</p>
          <p className="text-xs text-muted-foreground">Payments Due</p>
        </div>

        {/* New Enrollments */}
        <div className="p-4 bg-gradient-to-br from-violet-500/10 to-violet-600/5 rounded-xl border border-violet-500/20">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-violet-600" />
          </div>
          <p className="text-xl font-bold text-card-foreground font-display">{analytics.enrollmentsInRange}</p>
          <p className="text-xs text-muted-foreground">New Enrollments</p>
        </div>
      </div>

      {/* Charts Section */}
      {analytics.chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bar Chart */}
          <div className="lg:col-span-2 p-4 bg-muted/30 rounded-xl">
            <h3 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Monthly Collection Trend
            </h3>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <BarChart data={analytics.chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis 
                  dataKey="month" 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, '']}
                />
                <Bar dataKey="collected" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </div>

          {/* Pie Chart */}
          <div className="p-4 bg-muted/30 rounded-xl">
            <h3 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Collection Status
            </h3>
            {pieData.length > 0 ? (
              <div className="flex flex-col items-center">
                <ChartContainer config={chartConfig} className="h-[150px] w-full">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, '']}
                    />
                  </PieChart>
                </ChartContainer>
                <div className="flex gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-2))]" />
                    <span className="text-xs text-muted-foreground">Collected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-5))]" />
                    <span className="text-xs text-muted-foreground">Pending</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[150px] text-muted-foreground text-sm">
                No data for selected period
              </div>
            )}
          </div>
        </div>
      )}

      {analytics.chartData.length === 0 && (
        <div className="p-8 text-center text-muted-foreground bg-muted/30 rounded-xl">
          <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No data for selected period</p>
          <p className="text-sm mt-1">Try selecting a different date range</p>
        </div>
      )}
    </Card>
  );
}
