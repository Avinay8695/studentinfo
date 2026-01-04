import { useState, useMemo } from 'react';
import { Student } from '@/types/student';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  BarChart3,
  GraduationCap,
  PieChartIcon,
  Activity
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, isWithinInterval, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, Cell, PieChart, Pie, Legend, ResponsiveContainer, Tooltip, AreaChart, Area, CartesianGrid } from 'recharts';

interface DateRangeAnalyticsProps {
  students: Student[];
}

type DatePreset = 'this_month' | 'last_month' | 'last_3_months' | 'last_6_months' | 'this_year' | 'custom';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// Vibrant color palette for charts
const CHART_COLORS = [
  '#10b981', // emerald
  '#3b82f6', // blue  
  '#8b5cf6', // violet
  '#f59e0b', // amber
  '#ef4444', // red
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#14b8a6', // teal
  '#6366f1', // indigo
  '#f97316', // orange
];

export function DateRangeAnalytics({ students }: DateRangeAnalyticsProps) {
  const [datePreset, setDatePreset] = useState<DatePreset>('this_year');
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

  // Filter payments within date range and calculate analytics
  const analytics = useMemo(() => {
    const { start, end } = dateRange;
    
    let paymentsInRange: { isPaid: boolean; amount: number; month: number; year: number; studentName: string; course: string }[] = [];
    let enrollmentsInRange = 0;
    const courseData: { [key: string]: { students: number; collected: number; pending: number; total: number } } = {};
    
    students.forEach(student => {
      // Initialize course data
      if (!courseData[student.course]) {
        courseData[student.course] = { students: 0, collected: 0, pending: 0, total: 0 };
      }
      
      // Check enrollments in range
      if (student.enrollmentDate) {
        try {
          const enrollDate = parseISO(student.enrollmentDate);
          if (isWithinInterval(enrollDate, { start, end })) {
            enrollmentsInRange++;
            courseData[student.course].students++;
          }
        } catch (e) {
          // Invalid date, skip
        }
      }
      
      // Check payments in range
      student.monthlyPayments?.forEach(payment => {
        // Month is 1-indexed in the data (1=Jan, 12=Dec), convert to 0-indexed for Date
        const paymentDate = new Date(payment.year, payment.month - 1, 15);
        if (isWithinInterval(paymentDate, { start, end })) {
          paymentsInRange.push({
            isPaid: payment.isPaid,
            amount: payment.amount,
            month: payment.month, // Keep 1-indexed for display
            year: payment.year,
            studentName: student.fullName,
            course: student.course,
          });
          
          courseData[student.course].total += payment.amount;
          if (payment.isPaid) {
            courseData[student.course].collected += payment.amount;
          } else {
            courseData[student.course].pending += payment.amount;
          }
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

    // Monthly breakdown for chart - group by year-month
    const monthlyData: { [key: string]: { collected: number; pending: number; month: string; total: number; sortKey: string } } = {};
    paymentsInRange.forEach(payment => {
      // payment.month is 1-indexed, so subtract 1 for MONTH_NAMES array
      const key = `${payment.year}-${String(payment.month).padStart(2, '0')}`;
      if (!monthlyData[key]) {
        monthlyData[key] = {
          month: `${MONTH_NAMES[payment.month - 1]} ${String(payment.year).slice(-2)}`,
          collected: 0,
          pending: 0,
          total: 0,
          sortKey: key,
        };
      }
      monthlyData[key].total += payment.amount;
      if (payment.isPaid) {
        monthlyData[key].collected += payment.amount;
      } else {
        monthlyData[key].pending += payment.amount;
      }
    });

    const chartData = Object.values(monthlyData)
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .map(({ sortKey, ...rest }) => rest);

    // Course analytics data
    const courseAnalytics = Object.entries(courseData)
      .filter(([, data]) => data.total > 0 || data.students > 0)
      .map(([course, data], index) => ({
        course: course.length > 15 ? course.slice(0, 15) + '...' : course,
        fullName: course,
        ...data,
        collectionRate: data.total > 0 ? Math.round((data.collected / data.total) * 100) : 0,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }))
      .sort((a, b) => b.collected - a.collected);

    // Pie chart data for collection status
    const pieData = [
      { name: 'Collected', value: totalPaymentsCollected, color: '#10b981' },
      { name: 'Pending', value: totalPaymentsPending, color: '#ef4444' },
    ].filter(d => d.value > 0);

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
      courseAnalytics,
      pieData,
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

  const formatFullCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="p-6 mb-6 animate-fade-in card-elevated overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/5 to-transparent rounded-full -translate-y-32 translate-x-32 pointer-events-none" />
      
      {/* Header with Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 relative">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-xl shadow-lg shadow-primary/25">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-card-foreground">Performance Analytics</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <CalendarDays className="w-3.5 h-3.5" />
              {format(dateRange.start, 'dd MMM yyyy')} - {format(dateRange.end, 'dd MMM yyyy')}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={datePreset} onValueChange={(value: DatePreset) => setDatePreset(value)}>
            <SelectTrigger className="w-[160px] bg-background border-2 hover:border-primary/50 transition-colors">
              <Filter className="w-4 h-4 mr-2 text-primary" />
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
                  <Button variant="outline" size="sm" className="gap-2 border-2 hover:border-primary/50">
                    <CalendarDays className="w-4 h-4 text-primary" />
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
              <span className="text-muted-foreground font-medium">→</span>
              <Popover open={isEndOpen} onOpenChange={setIsEndOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 border-2 hover:border-primary/50">
                    <CalendarDays className="w-4 h-4 text-primary" />
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
        <div className="group p-4 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent rounded-2xl border border-emerald-500/20 hover:border-emerald-500/40 transition-all hover:shadow-lg hover:shadow-emerald-500/10">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg group-hover:scale-110 transition-transform">
              <IndianRupee className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3" />
              <span>{analytics.collectionRate}%</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-card-foreground font-display">{formatCurrency(analytics.totalPaymentsCollected)}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Collected</p>
        </div>

        {/* Pending */}
        <div className="group p-4 bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent rounded-2xl border border-rose-500/20 hover:border-rose-500/40 transition-all hover:shadow-lg hover:shadow-rose-500/10">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-rose-500/20 rounded-lg group-hover:scale-110 transition-transform">
              <AlertCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-500/10 px-2 py-1 rounded-full">
              <ArrowDownRight className="w-3 h-3" />
              <span>{100 - analytics.collectionRate}%</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-card-foreground font-display">{formatCurrency(analytics.totalPaymentsPending)}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Pending</p>
        </div>

        {/* Paid Count */}
        <div className="group p-4 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent rounded-2xl border border-blue-500/20 hover:border-blue-500/40 transition-all hover:shadow-lg hover:shadow-blue-500/10">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-500/20 rounded-lg group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-card-foreground font-display">{analytics.paidCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Payments Received</p>
        </div>

        {/* Unpaid Count */}
        <div className="group p-4 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent rounded-2xl border border-amber-500/20 hover:border-amber-500/40 transition-all hover:shadow-lg hover:shadow-amber-500/10">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-amber-500/20 rounded-lg group-hover:scale-110 transition-transform">
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-card-foreground font-display">{analytics.unpaidCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Payments Due</p>
        </div>

        {/* New Enrollments */}
        <div className="group p-4 bg-gradient-to-br from-violet-500/10 via-violet-500/5 to-transparent rounded-2xl border border-violet-500/20 hover:border-violet-500/40 transition-all hover:shadow-lg hover:shadow-violet-500/10">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-violet-500/20 rounded-lg group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4 text-violet-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-card-foreground font-display">{analytics.enrollmentsInRange}</p>
          <p className="text-xs text-muted-foreground mt-1">New Enrollments</p>
        </div>
      </div>

      {/* Tabs for different chart views */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50">
          <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="courses" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <GraduationCap className="w-4 h-4" />
            <span className="hidden sm:inline">Course Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Trends</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {analytics.chartData.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Bar Chart */}
              <div className="lg:col-span-2 p-5 bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl border border-border/50">
                <h3 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
                  <div className="p-1.5 bg-primary/10 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </div>
                  Monthly Collection Trend
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analytics.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis 
                      dataKey="month" 
                      tickLine={false} 
                      axisLine={false}
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false}
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(value) => value >= 1000 ? `₹${(value / 1000).toFixed(0)}K` : `₹${value}`}
                      width={60}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [formatFullCurrency(value), name === 'collected' ? 'Collected' : 'Pending']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)'
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Bar dataKey="collected" fill="#10b981" radius={[6, 6, 0, 0]} name="Collected" />
                    <Bar dataKey="pending" fill="#ef4444" radius={[6, 6, 0, 0]} name="Pending" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs text-muted-foreground font-medium">Collected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="text-xs text-muted-foreground font-medium">Pending</span>
                  </div>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="p-5 bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl border border-border/50">
                <h3 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
                  <div className="p-1.5 bg-primary/10 rounded-lg">
                    <PieChartIcon className="w-4 h-4 text-primary" />
                  </div>
                  Collection Status
                </h3>
                {analytics.pieData.length > 0 ? (
                  <div className="flex flex-col items-center">
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={analytics.pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {analytics.pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number, name: string, props: any) => [formatFullCurrency(value), props.payload.name]}
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '12px',
                            color: 'hsl(var(--foreground))'
                          }}
                          labelStyle={{ color: 'hsl(var(--foreground))' }}
                          itemStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex gap-6 mt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-xs text-muted-foreground font-medium">Collected</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-rose-500" />
                        <span className="text-xs text-muted-foreground font-medium">Pending</span>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-3xl font-bold text-primary font-display">{analytics.collectionRate}%</p>
                      <p className="text-xs text-muted-foreground">Collection Rate</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[180px] text-muted-foreground text-sm">
                    No data available
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground bg-muted/30 rounded-2xl border border-dashed border-border">
              <CalendarDays className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="font-semibold text-lg">No data for selected period</p>
              <p className="text-sm mt-1">Try selecting a different date range</p>
            </div>
          )}
        </TabsContent>

        {/* Course Analytics Tab */}
        <TabsContent value="courses" className="space-y-6">
          {analytics.courseAnalytics.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Course Collection Bar Chart */}
              <div className="p-5 bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl border border-border/50">
                <h3 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
                  <div className="p-1.5 bg-primary/10 rounded-lg">
                    <GraduationCap className="w-4 h-4 text-primary" />
                  </div>
                  Course-wise Collection
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart 
                    data={analytics.courseAnalytics.slice(0, 8)} 
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} horizontal={false} />
                    <XAxis 
                      type="number"
                      tickLine={false} 
                      axisLine={false}
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <YAxis 
                      type="category"
                      dataKey="course" 
                      tickLine={false} 
                      axisLine={false}
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      width={90}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        formatFullCurrency(value), 
                        name === 'collected' ? 'Collected' : 'Pending'
                      ]}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px'
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Bar dataKey="collected" fill="#10b981" radius={[0, 6, 6, 0]} stackId="a" />
                    <Bar dataKey="pending" fill="#ef4444" radius={[0, 6, 6, 0]} stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Course Cards */}
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2">
                <h3 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2 sticky top-0 bg-card py-2">
                  <div className="p-1.5 bg-primary/10 rounded-lg">
                    <Activity className="w-4 h-4 text-primary" />
                  </div>
                  Course Performance
                </h3>
                {analytics.courseAnalytics.map((course, index) => (
                  <div 
                    key={course.fullName}
                    className="p-4 bg-gradient-to-r from-muted/50 to-transparent rounded-xl border border-border/50 hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: course.color }}
                        />
                        <span className="font-medium text-sm text-card-foreground truncate max-w-[150px]" title={course.fullName}>
                          {course.fullName}
                        </span>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        course.collectionRate >= 80 ? 'bg-emerald-500/10 text-emerald-600' :
                        course.collectionRate >= 50 ? 'bg-amber-500/10 text-amber-600' :
                        'bg-rose-500/10 text-rose-600'
                      }`}>
                        {course.collectionRate}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span>{course.students} students enrolled</span>
                      <span>{formatCurrency(course.collected)} / {formatCurrency(course.total)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${course.collectionRate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground bg-muted/30 rounded-2xl border border-dashed border-border">
              <GraduationCap className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="font-semibold text-lg">No course data for selected period</p>
              <p className="text-sm mt-1">Try selecting a different date range</p>
            </div>
          )}
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          {analytics.chartData.length > 0 ? (
            <div className="p-5 bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl border border-border/50">
              <h3 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                Collection Trend Over Time
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                    </linearGradient>
                    <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis 
                    dataKey="month" 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(value) => value >= 1000 ? `₹${(value / 1000).toFixed(0)}K` : `₹${value}`}
                    width={60}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      formatFullCurrency(value), 
                      name === 'collected' ? 'Collected' : 'Pending'
                    ]}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="collected" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorCollected)" 
                    name="Collected"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="pending" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorPending)" 
                    name="Pending"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs text-muted-foreground font-medium">Collected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="text-xs text-muted-foreground font-medium">Pending</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground bg-muted/30 rounded-2xl border border-dashed border-border">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="font-semibold text-lg">No trend data for selected period</p>
              <p className="text-sm mt-1">Try selecting a different date range</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}
