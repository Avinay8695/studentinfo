import { useState, useMemo, useEffect, useRef } from 'react';
import { Student } from '@/types/student';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
  Activity,
  Zap,
  Trophy,
  Target,
  Flame,
  Star
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, isWithinInterval, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { 
  BarChart, Bar, XAxis, YAxis, Cell, PieChart, Pie, 
  ResponsiveContainer, Tooltip, AreaChart, Area, CartesianGrid,
  RadialBarChart, RadialBar
} from 'recharts';

interface DateRangeAnalyticsProps {
  students: Student[];
}

type DatePreset = 'this_month' | 'last_month' | 'last_3_months' | 'last_6_months' | 'this_year' | 'custom';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const CHART_COLORS = [
  '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444',
  '#06b6d4', '#ec4899', '#14b8a6', '#6366f1', '#f97316',
];

// Animated number counter hook
function useAnimatedNumber(target: number, duration = 800) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    const start = performance.now();
    const from = 0;
    
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setCurrent(Math.round(from + (target - from) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return current;
}

// SVG Circular Progress Ring
function CircularProgress({ value, size = 52, strokeWidth = 4, color }: { 
  value: number; size?: number; strokeWidth?: number; color: string 
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="hsl(var(--muted))"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  );
}

export function DateRangeAnalytics({ students }: DateRangeAnalyticsProps) {
  const [datePreset, setDatePreset] = useState<DatePreset>('this_year');
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);

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

  const analytics = useMemo(() => {
    const { start, end } = dateRange;
    
    let paymentsInRange: { isPaid: boolean; amount: number; month: number; year: number; dueMonth: number; dueYear: number; studentName: string; course: string }[] = [];
    let enrollmentsInRange = 0;
    const courseData: { [key: string]: { students: number; collected: number; pending: number; total: number } } = {};
    
    students.forEach(student => {
      if (!courseData[student.course]) {
        courseData[student.course] = { students: 0, collected: 0, pending: 0, total: 0 };
      }
      
      if (student.enrollmentDate) {
        try {
          const enrollDate = parseISO(student.enrollmentDate);
          if (isWithinInterval(enrollDate, { start, end })) {
            enrollmentsInRange++;
            courseData[student.course].students++;
          }
        } catch (e) {}
      }
      
      student.monthlyPayments?.forEach(payment => {
        const dueDate = new Date(payment.year, payment.month, 15);
        const dueMonth = payment.month + 1;
        const dueYear = payment.year;
        
        if (isWithinInterval(dueDate, { start, end })) {
          paymentsInRange.push({
            isPaid: payment.isPaid,
            amount: payment.amount,
            month: payment.month,
            year: payment.year,
            dueMonth,
            dueYear,
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

    const monthlyData: { [key: string]: { collected: number; pending: number; month: string; total: number; sortKey: string } } = {};
    
    let currentDate = new Date(start.getFullYear(), start.getMonth(), 1);
    const endDate = new Date(end.getFullYear(), end.getMonth(), 1);
    
    while (currentDate <= endDate) {
      const monthNum = currentDate.getMonth() + 1;
      const yearNum = currentDate.getFullYear();
      const key = `${yearNum}-${String(monthNum).padStart(2, '0')}`;
      
      monthlyData[key] = {
        month: `${MONTH_NAMES[monthNum - 1]} ${String(yearNum).slice(-2)}`,
        collected: 0,
        pending: 0,
        total: 0,
        sortKey: key,
      };
      
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    paymentsInRange.forEach(payment => {
      const key = `${payment.dueYear}-${String(payment.dueMonth).padStart(2, '0')}`;
      if (monthlyData[key]) {
        monthlyData[key].total += payment.amount;
        if (payment.isPaid) {
          monthlyData[key].collected += payment.amount;
        } else {
          monthlyData[key].pending += payment.amount;
        }
      }
    });

    const chartData = Object.values(monthlyData)
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .map(({ sortKey, ...rest }) => rest);

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

    const pieData = [
      { name: 'Collected', value: totalPaymentsCollected, color: '#10b981' },
      { name: 'Pending', value: totalPaymentsPending, color: '#ef4444' },
    ].filter(d => d.value > 0);

    // Generate insights
    const insights: { icon: React.ReactNode; text: string; type: 'success' | 'warning' | 'info' }[] = [];
    
    if (chartData.length > 0) {
      const bestMonth = chartData.reduce((best, d) => d.collected > best.collected ? d : best, chartData[0]);
      if (bestMonth.collected > 0) {
        insights.push({ 
          icon: <Flame className="w-3.5 h-3.5" />, 
          text: `Best: ${bestMonth.month} — ${formatCurrencyShort(bestMonth.collected)}`, 
          type: 'success' 
        });
      }
      
      const fullCollectionMonths = chartData.filter(d => d.total > 0 && d.collected >= d.total).length;
      if (fullCollectionMonths > 0) {
        insights.push({ 
          icon: <Star className="w-3.5 h-3.5" />, 
          text: `${fullCollectionMonths} month${fullCollectionMonths > 1 ? 's' : ''} at 100% collection`, 
          type: 'success' 
        });
      }
    }
    
    if (unpaidCount > 0) {
      insights.push({ 
        icon: <AlertCircle className="w-3.5 h-3.5" />, 
        text: `${unpaidCount} payment${unpaidCount > 1 ? 's' : ''} still pending`, 
        type: 'warning' 
      });
    }
    
    if (collectionRate >= 80) {
      insights.push({ 
        icon: <Trophy className="w-3.5 h-3.5" />, 
        text: `Strong ${collectionRate}% collection rate`, 
        type: 'success' 
      });
    } else if (collectionRate > 0 && collectionRate < 50) {
      insights.push({ 
        icon: <Target className="w-3.5 h-3.5" />, 
        text: `Collection rate needs attention: ${collectionRate}%`, 
        type: 'warning' 
      });
    }

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
      insights,
    };
  }, [students, dateRange]);

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount}`;
  };

  const formatFullCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Animated counters
  const animatedCollected = useAnimatedNumber(analytics.totalPaymentsCollected);
  const animatedPending = useAnimatedNumber(analytics.totalPaymentsPending);
  const animatedPaidCount = useAnimatedNumber(analytics.paidCount);
  const animatedUnpaidCount = useAnimatedNumber(analytics.unpaidCount);
  const animatedEnrollments = useAnimatedNumber(analytics.enrollmentsInRange);

  // Radial chart data for the donut gauge
  const radialData = [
    { name: 'Rate', value: analytics.collectionRate, fill: analytics.collectionRate >= 70 ? '#10b981' : analytics.collectionRate >= 40 ? '#f59e0b' : '#ef4444' }
  ];

  // Find peak/low for trends
  const peakMonth = analytics.chartData.length > 0 
    ? analytics.chartData.reduce((best, d) => d.collected > best.collected ? d : best, analytics.chartData[0])
    : null;
  const lowMonth = analytics.chartData.length > 0 
    ? analytics.chartData.filter(d => d.total > 0).reduce((worst, d) => d.collected < worst.collected ? d : worst, analytics.chartData.filter(d => d.total > 0)[0] || analytics.chartData[0])
    : null;

  // Cumulative data for trends
  const trendDataWithCumulative = useMemo(() => {
    let cumulative = 0;
    return analytics.chartData.map(d => {
      cumulative += d.collected;
      return { ...d, cumulative };
    });
  }, [analytics.chartData]);

  return (
    <Card className="p-4 sm:p-6 mb-6 animate-fade-in card-elevated overflow-hidden relative">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/5 to-transparent rounded-full -translate-y-32 translate-x-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-accent/5 to-transparent rounded-full translate-y-24 -translate-x-24 pointer-events-none" />
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 relative">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-xl shadow-lg shadow-primary/25">
            <BarChart3 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Performance Analytics
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {format(dateRange.start, 'dd MMM yyyy')} — {format(dateRange.end, 'dd MMM yyyy')}
              </p>
            </div>
            {analytics.totalPaymentsExpected > 0 && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-primary" />
                Collected <span className="font-semibold text-foreground">{analytics.collectionRate}%</span> of {formatCurrency(analytics.totalPaymentsExpected)} expected revenue
              </p>
            )}
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
                    onSelect={(date) => { setCustomStartDate(date); setIsStartOpen(false); }}
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
                    onSelect={(date) => { setCustomEndDate(date); setIsEndOpen(false); }}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
      </div>

      {/* Anchor Metric - Total Expected */}
      {analytics.totalPaymentsExpected > 0 && (
        <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border border-primary/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Expected Revenue</p>
            <p className="text-2xl sm:text-3xl font-bold font-display text-foreground mt-1">{formatFullCurrency(analytics.totalPaymentsExpected)}</p>
          </div>
          <div className="flex items-center gap-2">
            <CircularProgress value={analytics.collectionRate} size={48} strokeWidth={5} color={analytics.collectionRate >= 70 ? '#10b981' : analytics.collectionRate >= 40 ? '#f59e0b' : '#ef4444'} />
            <div className="text-right">
              <p className="text-lg font-bold font-display text-foreground">{analytics.collectionRate}%</p>
              <p className="text-[10px] text-muted-foreground">Collected</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-5">
        {/* Collected */}
        <div className="group relative p-4 rounded-2xl border border-emerald-500/20 hover:border-emerald-500/40 transition-all hover:shadow-lg hover:shadow-emerald-500/10 backdrop-blur-sm bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity">
            <CircularProgress value={analytics.collectionRate} size={80} strokeWidth={3} color="#10b981" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg group-hover:scale-110 transition-transform">
                <IndianRupee className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <ArrowUpRight className="w-3 h-3" />
                <span>{analytics.collectionRate}%</span>
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-card-foreground font-display">{formatCurrency(animatedCollected)}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 font-medium">Total Collected</p>
          </div>
        </div>

        {/* Pending */}
        <div className="group relative p-4 rounded-2xl border border-rose-500/20 hover:border-rose-500/40 transition-all hover:shadow-lg hover:shadow-rose-500/10 backdrop-blur-sm bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity">
            <CircularProgress value={100 - analytics.collectionRate} size={80} strokeWidth={3} color="#ef4444" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-rose-500/20 rounded-lg group-hover:scale-110 transition-transform">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
                <ArrowDownRight className="w-3 h-3" />
                <span>{100 - analytics.collectionRate}%</span>
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-card-foreground font-display">{formatCurrency(animatedPending)}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 font-medium">Total Pending</p>
          </div>
        </div>

        {/* Paid Count */}
        <div className="group p-4 rounded-2xl border border-blue-500/20 hover:border-blue-500/40 transition-all hover:shadow-lg hover:shadow-blue-500/10 backdrop-blur-sm bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-500/20 rounded-lg group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-card-foreground font-display">{animatedPaidCount}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 font-medium">Payments Received</p>
        </div>

        {/* Unpaid Count */}
        <div className="group p-4 rounded-2xl border border-amber-500/20 hover:border-amber-500/40 transition-all hover:shadow-lg hover:shadow-amber-500/10 backdrop-blur-sm bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-amber-500/20 rounded-lg group-hover:scale-110 transition-transform">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-card-foreground font-display">{animatedUnpaidCount}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 font-medium">Payments Due</p>
        </div>

        {/* New Enrollments */}
        <div className="group p-4 rounded-2xl border border-violet-500/20 hover:border-violet-500/40 transition-all hover:shadow-lg hover:shadow-violet-500/10 backdrop-blur-sm bg-gradient-to-br from-violet-500/10 via-violet-500/5 to-transparent">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-violet-500/20 rounded-lg group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-card-foreground font-display">{animatedEnrollments}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 font-medium">New Enrollments</p>
        </div>
      </div>

      {/* Quick Insights Panel */}
      {analytics.insights.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {analytics.insights.map((insight, i) => (
            <div 
              key={i}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border animate-fade-in",
                insight.type === 'success' && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
                insight.type === 'warning' && "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
                insight.type === 'info' && "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
              )}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {insight.icon}
              {insight.text}
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
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
            <>
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
                    <BarChart data={analytics.chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="barCollected" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                          <stop offset="100%" stopColor="#059669" stopOpacity={0.8}/>
                        </linearGradient>
                        <linearGradient id="barPending" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity={1}/>
                          <stop offset="100%" stopColor="#dc2626" stopOpacity={0.8}/>
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
                        formatter={(value: number, name: string) => {
                          const label = name === 'collected' ? 'Collected' : name === 'pending' ? 'Pending' : name;
                          return [formatFullCurrency(value), label];
                        }}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '12px',
                          boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)'
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Bar dataKey="collected" fill="url(#barCollected)" radius={[6, 6, 0, 0]} name="collected" />
                      <Bar dataKey="pending" fill="url(#barPending)" radius={[6, 6, 0, 0]} name="pending" />
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

                {/* Radial Gauge */}
                <div className="p-5 bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl border border-border/50 flex flex-col">
                  <h3 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                      <PieChartIcon className="w-4 h-4 text-primary" />
                    </div>
                    Collection Rate
                  </h3>
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="relative">
                      <ResponsiveContainer width={180} height={180}>
                        <RadialBarChart
                          cx="50%"
                          cy="50%"
                          innerRadius="70%"
                          outerRadius="100%"
                          barSize={12}
                          data={radialData}
                          startAngle={90}
                          endAngle={-270}
                        >
                          <RadialBar
                            background={{ fill: 'hsl(var(--muted))' }}
                            dataKey="value"
                            cornerRadius={10}
                          />
                        </RadialBarChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-3xl font-bold font-display text-foreground">{analytics.collectionRate}%</p>
                        <p className="text-[10px] text-muted-foreground font-medium">Collected</p>
                      </div>
                    </div>
                    <div className="flex gap-6 mt-3">
                      <div className="text-center">
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(analytics.totalPaymentsCollected)}</p>
                        <p className="text-[10px] text-muted-foreground">Collected</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{formatCurrency(analytics.totalPaymentsPending)}</p>
                        <p className="text-[10px] text-muted-foreground">Pending</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Insights Box */}
              {(peakMonth && peakMonth.collected > 0) && (
                <div className="p-4 bg-gradient-to-r from-muted/40 to-muted/20 rounded-2xl border border-border/50">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-primary" />
                    Key Insights
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/30">
                      <div className="p-2 bg-emerald-500/10 rounded-lg">
                        <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Best Month</p>
                        <p className="text-sm font-semibold text-card-foreground">{peakMonth.month} — {formatCurrency(peakMonth.collected)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/30">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Payments</p>
                        <p className="text-sm font-semibold text-card-foreground">{analytics.paidCount + analytics.unpaidCount} tracked</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/30">
                      <div className="p-2 bg-violet-500/10 rounded-lg">
                        <GraduationCap className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Active Courses</p>
                        <p className="text-sm font-semibold text-card-foreground">{analytics.courseAnalytics.length} courses</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
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

              {/* Course Cards with rank badges & mini donuts */}
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2">
                <h3 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2 sticky top-0 bg-card py-2 z-10">
                  <div className="p-1.5 bg-primary/10 rounded-lg">
                    <Activity className="w-4 h-4 text-primary" />
                  </div>
                  Course Performance
                </h3>
                {analytics.courseAnalytics.map((course, index) => (
                  <div 
                    key={course.fullName}
                    className="p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-all group bg-gradient-to-r from-muted/50 to-transparent"
                    style={{ borderLeftWidth: '4px', borderLeftColor: course.color }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {/* Rank badge */}
                        {index < 3 && (
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                            index === 0 && "bg-amber-500/20 text-amber-600 dark:text-amber-400",
                            index === 1 && "bg-slate-400/20 text-slate-600 dark:text-slate-400",
                            index === 2 && "bg-orange-500/20 text-orange-600 dark:text-orange-400",
                          )}>
                            #{index + 1}
                          </div>
                        )}
                        {/* Mini donut */}
                        <div className="relative">
                          <CircularProgress value={course.collectionRate} size={36} strokeWidth={3} color={course.color} />
                          <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-card-foreground">
                            {course.collectionRate}%
                          </span>
                        </div>
                        <span className="font-medium text-sm text-card-foreground truncate max-w-[120px]" title={course.fullName}>
                          {course.fullName}
                        </span>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        course.collectionRate >= 80 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                        course.collectionRate >= 50 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                        'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}>
                        {formatCurrency(course.collected)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2 pl-1">
                      <span>{course.students} student{course.students !== 1 ? 's' : ''} enrolled</span>
                      <span>{formatCurrency(course.collected)} / {formatCurrency(course.total)}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${course.collectionRate}%`, backgroundColor: course.color }}
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
            <div className="p-5 bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl border border-border/50 relative overflow-hidden">
              {/* Subtle mesh gradient */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/[0.02] via-transparent to-accent/[0.02] pointer-events-none" />
              
              <h3 className="text-sm font-semibold text-card-foreground mb-2 flex items-center gap-2 relative z-10">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                Collection Trend Over Time
              </h3>
              
              {/* Peak/Low indicators */}
              {peakMonth && lowMonth && peakMonth.collected !== lowMonth.collected && (
                <div className="flex flex-wrap gap-3 mb-4 relative z-10">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                    <ArrowUpRight className="w-3 h-3" />
                    Peak: {peakMonth.month} ({formatCurrency(peakMonth.collected)})
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
                    <ArrowDownRight className="w-3 h-3" />
                    Low: {lowMonth.month} ({formatCurrency(lowMonth.collected)})
                  </div>
                </div>
              )}

              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trendDataWithCumulative} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCollectedTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.02}/>
                    </linearGradient>
                    <linearGradient id="colorPendingTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
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
                      name === 'collected' ? 'Collected' : name === 'pending' ? 'Pending' : 'Cumulative'
                    ]}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="collected" 
                    stroke="#10b981" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#colorCollectedTrend)" 
                    name="collected"
                    dot={(props: any) => {
                      const { cx, cy, payload } = props;
                      if (peakMonth && payload.month === peakMonth.month && peakMonth.collected > 0) {
                        return <circle cx={cx} cy={cy} r={5} fill="#10b981" stroke="white" strokeWidth={2} />;
                      }
                      if (lowMonth && payload.month === lowMonth.month && lowMonth.collected > 0 && peakMonth?.collected !== lowMonth?.collected) {
                        return <circle cx={cx} cy={cy} r={5} fill="#ef4444" stroke="white" strokeWidth={2} />;
                      }
                      return <circle cx={cx} cy={cy} r={0} />;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="pending" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorPendingTrend)" 
                    name="pending"
                    strokeDasharray="5 5"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-4 relative z-10">
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

function formatCurrencyShort(amount: number) {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
}
