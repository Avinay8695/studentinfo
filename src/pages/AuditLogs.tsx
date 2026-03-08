import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, formatDistanceToNow, isToday, isYesterday, isThisWeek, parseISO, startOfDay, endOfDay, subDays } from 'date-fns';
import { 
  Plus, Pencil, Trash2, LogIn, LogOut, Filter, User, GraduationCap, CreditCard,
  ChevronRight, Calendar, Clock, ArrowLeft, Search, Download, FileSpreadsheet,
  FileJson, LayoutList, Activity, ChevronLeft, X, Shield, Globe, Monitor, RotateCcw, Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AuditLogsSkeleton } from '@/components/skeletons/AuditLogsSkeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { BottomSheet } from '@/components/ui/responsive-modal';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { generateMonthlyPayments } from '@/hooks/useStudents';
import { logStudentCreate } from '@/utils/logger';

interface AuditLog {
  id: string;
  created_at: string;
  action_type: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
  entity_type: 'STUDENT' | 'PAYMENT' | 'USER';
  entity_id: string | null;
  performed_by: string | null;
  performed_by_name: string;
  details: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    description?: string;
    [key: string]: unknown;
  };
}

const actionConfig = {
  CREATE: { icon: Plus, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20', badgeBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25', label: 'Created' },
  UPDATE: { icon: Pencil, color: 'text-amber-500', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20', badgeBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25', label: 'Updated' },
  DELETE: { icon: Trash2, color: 'text-red-500', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20', badgeBg: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/25', label: 'Deleted' },
  LOGIN: { icon: LogIn, color: 'text-blue-500', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20', badgeBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25', label: 'Login' },
  LOGOUT: { icon: LogOut, color: 'text-blue-500', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20', badgeBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25', label: 'Logout' },
};

const entityConfig = {
  STUDENT: { icon: GraduationCap, label: 'Student Management' },
  PAYMENT: { icon: CreditCard, label: 'Payment' },
  USER: { icon: User, label: 'Authentication' },
};

const moduleMap: Record<string, string> = {
  STUDENT: 'Student Management',
  PAYMENT: 'Student Management',
  USER: 'Authentication',
};

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const fieldLabels: Record<string, string> = {
  full_name: 'Name', course: 'Course', batch: 'Batch', mobile_number: 'Mobile Number',
  fees_amount: 'Total Fees', fees_status: 'Payment Status', monthly_fee: 'Monthly Fee',
  duration_months: 'Course Duration', enrollment_date: 'Enrollment Date',
  is_paid: 'Payment Status', month: 'Month', year: 'Year', amount: 'Amount', paid_date: 'Paid Date',
};

function formatValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return 'Not set';
  if (key === 'is_paid') return value === true ? '✅ Paid' : '❌ Unpaid';
  if (key === 'month' && typeof value === 'number') return monthNames[value - 1] || `Month ${value}`;
  if (key === 'fees_status') {
    const m: Record<string, string> = { paid: '✅ Fully Paid', partial: '⏳ Partially Paid', pending: '❌ Pending' };
    return m[value as string] || String(value);
  }
  if (['fees_amount', 'monthly_fee', 'amount'].includes(key)) return `₹${Number(value).toLocaleString('en-IN')}`;
  if (key === 'duration_months') return `${value} months`;
  if (['enrollment_date', 'paid_date'].includes(key)) {
    try { return format(parseISO(value as string), 'dd MMM yyyy'); } catch { return String(value); }
  }
  return String(value);
}

function formatChanges(before?: Record<string, unknown>, after?: Record<string, unknown>): { field: string; from: string; to: string }[] {
  if (!before && !after) return [];
  const changes: { field: string; from: string; to: string }[] = [];
  const allKeys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
  allKeys.forEach(key => {
    const bv = before?.[key]; const av = after?.[key];
    if (JSON.stringify(bv) !== JSON.stringify(av)) {
      changes.push({
        field: fieldLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        from: formatValue(key, bv), to: formatValue(key, av)
      });
    }
  });
  return changes;
}

function getDateGroup(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (isThisWeek(date)) return 'This Week';
  return format(date, 'MMMM d, yyyy');
}

function groupLogsByDate(logs: AuditLog[]): Record<string, AuditLog[]> {
  return logs.reduce((groups, log) => {
    const group = getDateGroup(log.created_at);
    if (!groups[group]) groups[group] = [];
    groups[group].push(log);
    return groups;
  }, {} as Record<string, AuditLog[]>);
}

const ITEMS_PER_PAGE = 20;

// Export helpers
function exportLogsToCSV(logs: AuditLog[]) {
  const headers = ['Timestamp', 'User', 'Role', 'Action', 'Module', 'Description'];
  const rows = logs.map(log => [
    format(parseISO(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
    log.performed_by_name,
    'Admin',
    log.action_type,
    moduleMap[log.entity_type] || log.entity_type,
    log.details?.description || `${actionConfig[log.action_type]?.label || log.action_type} a ${(entityConfig[log.entity_type]?.label || log.entity_type).toLowerCase()}`,
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

function exportLogsToPDF(logs: AuditLog[]) {
  const html = `<!DOCTYPE html><html><head><title>Audit Logs Report</title>
<style>
  body{font-family:system-ui,sans-serif;padding:40px;color:#1a1a2e;font-size:13px}
  h1{font-size:22px;margin-bottom:4px;color:#0f172a}
  .subtitle{color:#64748b;margin-bottom:24px;font-size:13px}
  table{width:100%;border-collapse:collapse;margin-top:16px}
  th{background:#f1f5f9;text-align:left;padding:10px 12px;font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#475569;border-bottom:2px solid #e2e8f0}
  td{padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:12px}
  tr:hover{background:#fafbfc}
  .badge{display:inline-block;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600}
  .badge-create{background:#dcfce7;color:#166534}
  .badge-update{background:#fef3c7;color:#92400e}
  .badge-delete{background:#fee2e2;color:#991b1b}
  .badge-login,.badge-logout{background:#dbeafe;color:#1e40af}
  .footer{margin-top:32px;text-align:center;color:#94a3b8;font-size:11px}
</style></head><body>
<h1>📋 Audit Logs Report</h1>
<p class="subtitle">Generated on ${format(new Date(), 'PPpp')} • ${logs.length} entries</p>
<table><thead><tr><th>Time</th><th>User</th><th>Action</th><th>Module</th><th>Description</th></tr></thead><tbody>
${logs.map(log => `<tr>
  <td>${format(parseISO(log.created_at), 'dd MMM yyyy, h:mm a')}</td>
  <td>${log.performed_by_name}</td>
  <td><span class="badge badge-${log.action_type.toLowerCase()}">${log.action_type}</span></td>
  <td>${moduleMap[log.entity_type] || log.entity_type}</td>
  <td>${log.details?.description || `${actionConfig[log.action_type]?.label || log.action_type} a ${(entityConfig[log.entity_type]?.label || log.entity_type).toLowerCase()}`}</td>
</tr>`).join('')}
</tbody></table>
<div class="footer">Student Management System — Audit Report</div>
</body></html>`;
  const w = window.open('', '_blank');
  if (w) { w.document.write(html); w.document.close(); w.print(); }
}

export default function AuditLogs() {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');
  const [currentPage, setCurrentPage] = useState(1);
  const [restoring, setRestoring] = useState(false);

  const { data: allLogs = [], isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);
      if (error) throw error;
      return (data || []) as unknown as AuditLog[];
    },
    enabled: isAdmin,
  });

  // Unique users for filter
  const uniqueUsers = useMemo(() => {
    const users = new Map<string, string>();
    allLogs.forEach(l => {
      if (l.performed_by && !users.has(l.performed_by)) {
        users.set(l.performed_by, l.performed_by_name);
      }
    });
    return Array.from(users.entries()).map(([id, name]) => ({ id, name }));
  }, [allLogs]);

  // Client-side filtering
  const filteredLogs = useMemo(() => {
    let logs = allLogs;
    if (actionFilter !== 'all') logs = logs.filter(l => l.action_type === actionFilter);
    if (entityFilter !== 'all') logs = logs.filter(l => l.entity_type === entityFilter);
    if (userFilter !== 'all') logs = logs.filter(l => l.performed_by === userFilter);
    if (dateFilter !== 'all') {
      const now = new Date();
      logs = logs.filter(l => {
        const d = parseISO(l.created_at);
        switch (dateFilter) {
          case 'today': return d >= startOfDay(now);
          case 'yesterday': return d >= startOfDay(subDays(now, 1)) && d < startOfDay(now);
          case 'week': return d >= startOfDay(subDays(now, 7));
          case 'month': return d >= startOfDay(subDays(now, 30));
          default: return true;
        }
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      logs = logs.filter(l =>
        l.performed_by_name.toLowerCase().includes(q) ||
        (l.details?.description && String(l.details.description).toLowerCase().includes(q)) ||
        l.action_type.toLowerCase().includes(q) ||
        l.entity_type.toLowerCase().includes(q)
      );
    }
    return logs;
  }, [allLogs, actionFilter, entityFilter, userFilter, dateFilter, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const groupedLogs = groupLogsByDate(paginatedLogs);

  const activeFilterCount = (actionFilter !== 'all' ? 1 : 0) + (entityFilter !== 'all' ? 1 : 0) + (userFilter !== 'all' ? 1 : 0) + (dateFilter !== 'all' ? 1 : 0);

  const clearFilters = () => {
    setActionFilter('all'); setEntityFilter('all'); setUserFilter('all'); setDateFilter('all'); setSearchQuery(''); setCurrentPage(1);
  };

  // Restore deleted student
  const handleRestoreStudent = async (log: AuditLog) => {
    const before = log.details?.before as Record<string, unknown> | undefined;
    if (!before) return;

    setRestoring(true);
    try {
      const { data: student, error: insertError } = await supabase
        .from('students')
        .insert({
          full_name: before.full_name as string,
          course: before.course as string,
          batch: (before.batch as string) || null,
          mobile_number: (before.mobile_number as string) || null,
          fees_amount: Number(before.fees_amount) || 0,
          monthly_fee: Number(before.monthly_fee) || 0,
          duration_months: Number(before.duration_months) || 1,
          fees_status: (before.fees_status as string) || 'not_paid',
          enrollment_date: (before.enrollment_date as string) || new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Generate monthly payments
      const enrollmentDate = (before.enrollment_date as string) || new Date().toISOString().split('T')[0];
      const payments = generateMonthlyPayments(
        enrollmentDate,
        Number(before.duration_months) || 1,
        Number(before.fees_amount) || 0
      );

      if (payments.length > 0) {
        const paymentRows = payments.map(p => ({
          student_id: student.id,
          month: p.month + 1,
          year: p.year,
          amount: p.amount,
          is_paid: false,
        }));
        await supabase.from('monthly_payments').insert(paymentRows);
      }

      // Log the restore
      await logStudentCreate(student.id, {
        full_name: before.full_name,
        course: before.course,
        description: `Restored deleted student: ${before.full_name}`,
      });

      toast.success(`Student "${before.full_name}" restored successfully!`);
      setSelectedLog(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to restore student');
    } finally {
      setRestoring(false);
    }
  };

  // Stats
  const stats = useMemo(() => ({
    total: allLogs.length,
    creates: allLogs.filter(l => l.action_type === 'CREATE').length,
    updates: allLogs.filter(l => l.action_type === 'UPDATE').length,
    deletes: allLogs.filter(l => l.action_type === 'DELETE').length,
    logins: allLogs.filter(l => l.action_type === 'LOGIN' || l.action_type === 'LOGOUT').length,
  }), [allLogs]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container max-w-6xl mx-auto px-4 py-6 sm:py-8">
          <AuditLogsSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-6">Only administrators can view audit logs.</p>
            <Button onClick={() => navigate('/')}>Go Back Home</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const FilterControls = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Action Type</label>
        <Select value={actionFilter} onValueChange={v => { setActionFilter(v); setCurrentPage(1); }}>
          <SelectTrigger className="w-full h-11 bg-background"><SelectValue placeholder="Action Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="CREATE">Create</SelectItem>
            <SelectItem value="UPDATE">Update</SelectItem>
            <SelectItem value="DELETE">Delete</SelectItem>
            <SelectItem value="LOGIN">Login</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Module</label>
        <Select value={entityFilter} onValueChange={v => { setEntityFilter(v); setCurrentPage(1); }}>
          <SelectTrigger className="w-full h-11 bg-background"><SelectValue placeholder="Entity Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modules</SelectItem>
            <SelectItem value="STUDENT">Student Management</SelectItem>
            <SelectItem value="PAYMENT">Payment</SelectItem>
            <SelectItem value="USER">Authentication</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Date Range</label>
        <Select value={dateFilter} onValueChange={v => { setDateFilter(v); setCurrentPage(1); }}>
          <SelectTrigger className="w-full h-11 bg-background"><SelectValue placeholder="Date Range" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="yesterday">Yesterday</SelectItem>
            <SelectItem value="week">Last 7 Days</SelectItem>
            <SelectItem value="month">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" size="sm" onClick={() => navigate('/')}
          className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Audit Logs</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Track all changes and actions across your system
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { exportLogsToCSV(filteredLogs); toast.success('Exported to CSV'); }} className="gap-2 cursor-pointer">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export as CSV
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { exportLogsToPDF(filteredLogs); toast.success('PDF report generated'); }} className="gap-2 cursor-pointer">
                  <FileJson className="w-4 h-4 text-blue-600" /> Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Total', value: stats.total, icon: Activity, color: 'text-foreground', bg: 'bg-muted' },
            { label: 'Created', value: stats.creates, icon: Plus, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Updated', value: stats.updates, icon: Pencil, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'Deleted', value: stats.deletes, icon: Trash2, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10' },
            { label: 'Logins', value: stats.logins, icon: LogIn, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
          ].map(stat => (
            <Card key={stat.label} className="border-border/50">
              <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", stat.bg)}>
                  <stat.icon className={cn("w-4 h-4", stat.color)} />
                </div>
                <div className="min-w-0">
                  <p className="text-lg sm:text-xl font-bold text-foreground leading-none">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search + Filters + View Toggle */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, action, description..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="pl-9 h-10"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile Filter Button */}
            {isMobile ? (
              <Button variant="outline" onClick={() => setFilterSheetOpen(true)} className="gap-2 h-10">
                <Filter className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">{activeFilterCount}</Badge>
                )}
              </Button>
            ) : (
              /* Desktop Filters Inline */
              <>
                <Select value={actionFilter} onValueChange={v => { setActionFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[130px] h-10"><SelectValue placeholder="Action" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="CREATE">Create</SelectItem>
                    <SelectItem value="UPDATE">Update</SelectItem>
                    <SelectItem value="DELETE">Delete</SelectItem>
                    <SelectItem value="LOGIN">Login</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={entityFilter} onValueChange={v => { setEntityFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[130px] h-10"><SelectValue placeholder="Module" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modules</SelectItem>
                    <SelectItem value="STUDENT">Students</SelectItem>
                    <SelectItem value="PAYMENT">Payments</SelectItem>
                    <SelectItem value="USER">Auth</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={v => { setDateFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[130px] h-10"><SelectValue placeholder="Date" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}

            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                <X className="w-4 h-4 mr-1" /> Clear
              </Button>
            )}

            {/* View Toggle */}
            <Tabs value={viewMode} onValueChange={v => setViewMode(v as 'timeline' | 'table')} className="hidden sm:block">
              <TabsList className="h-10">
                <TabsTrigger value="timeline" className="gap-1.5 px-3"><Activity className="w-4 h-4" /> Timeline</TabsTrigger>
                <TabsTrigger value="table" className="gap-1.5 px-3"><LayoutList className="w-4 h-4" /> Table</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Mobile Filter Bottom Sheet */}
        {isMobile && (
          <BottomSheet
            open={filterSheetOpen} onOpenChange={setFilterSheetOpen}
            title="Filter Audit Logs" description="Filter by action, module, and date range"
            footer={
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => { clearFilters(); setFilterSheetOpen(false); }}>Clear All</Button>
                <Button className="flex-1" onClick={() => setFilterSheetOpen(false)}>Apply</Button>
              </div>
            }
          >
            <FilterControls />
          </BottomSheet>
        )}

        {/* Results Info */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredLogs.length)} of {filteredLogs.length} logs
          </p>
          {/* Mobile view toggle */}
          {isMobile && (
            <Tabs value={viewMode} onValueChange={v => setViewMode(v as 'timeline' | 'table')}>
              <TabsList className="h-8">
                <TabsTrigger value="timeline" className="px-2 text-xs"><Activity className="w-3 h-3" /></TabsTrigger>
                <TabsTrigger value="table" className="px-2 text-xs"><LayoutList className="w-3 h-3" /></TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>

        {/* Content */}
        {filteredLogs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No Activity Found</h3>
            <p className="text-muted-foreground text-sm">
              {searchQuery || activeFilterCount > 0 ? 'Try adjusting your search or filters.' : 'Activities will appear here as you use the system.'}
            </p>
          </div>
        ) : viewMode === 'table' ? (
          /* TABLE VIEW */
          <Card className="border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="font-semibold text-xs uppercase tracking-wider">Time</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider">User</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider hidden sm:table-cell">Role</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider">Action</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider hidden md:table-cell">Module</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider">Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLogs.map(log => {
                    const action = actionConfig[log.action_type] || actionConfig.LOGIN;
                    return (
                      <TableRow key={log.id} onClick={() => setSelectedLog(log)} className="cursor-pointer group">
                        <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                          <div>{format(parseISO(log.created_at), 'dd MMM')}</div>
                          <div className="text-[11px]">{format(parseISO(log.created_at), 'h:mm a')}</div>
                        </TableCell>
                        <TableCell className="font-medium text-sm">{log.performed_by_name}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline" className="text-xs border-primary/20 text-primary">Admin</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("text-xs border", action.badgeBg)}>
                            {log.action_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                          {moduleMap[log.entity_type] || log.entity_type}
                        </TableCell>
                        <TableCell className="text-sm max-w-[200px] sm:max-w-[300px] truncate">
                          {log.details?.description || `${action.label} a ${(entityConfig[log.entity_type]?.label || log.entity_type).toLowerCase()}`}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        ) : (
          /* TIMELINE VIEW */
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-border via-border to-transparent hidden sm:block" />

            {Object.entries(groupedLogs).map(([dateGroup, groupLogs], groupIndex) => (
              <div key={dateGroup} className="mb-8">
                {/* Date Group Header */}
                <div className="relative flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center z-10">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">{dateGroup}</h3>
                  <Badge variant="secondary" className="text-xs">{groupLogs.length}</Badge>
                </div>

                {/* Log Items */}
                <div className="space-y-3 sm:ml-5 sm:pl-8 sm:border-l sm:border-border/50">
                  {groupLogs.map((log, index) => {
                    const action = actionConfig[log.action_type] || actionConfig.LOGIN;
                    const entity = entityConfig[log.entity_type] || entityConfig.USER;
                    const ActionIcon = action.icon;

                    return (
                      <div
                        key={log.id}
                        onClick={() => setSelectedLog(log)}
                        className={cn(
                          "relative group cursor-pointer p-4 rounded-xl",
                          "bg-card border border-border/50",
                          "hover:border-border hover:shadow-sm",
                          "transition-all duration-200"
                        )}
                      >
                        {/* Desktop connector */}
                        <div className="absolute left-0 top-1/2 -translate-x-[calc(2rem+1px)] w-8 h-px bg-border/50 hidden sm:block" />
                        <div className={cn(
                          "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[calc(2rem+5px)]",
                          "w-2.5 h-2.5 rounded-full border-2 hidden sm:block",
                          action.bgColor, action.borderColor
                        )} />

                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
                            action.bgColor, "border", action.borderColor
                          )}>
                            <ActionIcon className={cn("w-5 h-5", action.color)} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              <span className="font-semibold text-sm text-foreground">{log.performed_by_name}</span>
                              <Badge className={cn("text-[10px] border", action.badgeBg)}>{action.label}</Badge>
                              <Badge variant="secondary" className="text-[10px]">{moduleMap[log.entity_type] || entity.label}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {log.details?.description || `${action.label} a ${entity.label.toLowerCase()}`}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{formatDistanceToNow(parseISO(log.created_at), { addSuffix: true })}</span>
                              <span>•</span>
                              <span>{format(parseISO(log.created_at), 'h:mm a')}</span>
                            </div>
                          </div>

                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0 mt-1" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline" size="sm" disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page: number;
                if (totalPages <= 5) page = i + 1;
                else if (currentPage <= 3) page = i + 1;
                else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                else page = currentPage - 2 + i;
                return (
                  <Button
                    key={page} variant={currentPage === page ? 'default' : 'ghost'}
                    size="sm" className="w-9 h-9 p-0"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline" size="sm" disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </main>

      <Footer />

      {/* Detail Sheet */}
      <Sheet open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              {selectedLog && (() => {
                const action = actionConfig[selectedLog.action_type] || actionConfig.LOGIN;
                const entity = entityConfig[selectedLog.entity_type] || entityConfig.USER;
                const Icon = action.icon;
                return (<>
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", action.bgColor, "border", action.borderColor)}>
                    <Icon className={cn("w-4 h-4", action.color)} />
                  </div>
                  <span>{action.label} {entity.label}</span>
                </>);
              })()}
            </SheetTitle>
            <SheetDescription>
              {selectedLog && (
                <span>By {selectedLog.performed_by_name} • {format(parseISO(selectedLog.created_at), 'PPpp')}</span>
              )}
            </SheetDescription>
          </SheetHeader>

          {selectedLog && (
            <div className="mt-6 space-y-6">
              {selectedLog.details?.description && (
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-foreground">{selectedLog.details.description}</p>
                </div>
              )}

              {(selectedLog.details?.before || selectedLog.details?.after) && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Pencil className="w-4 h-4" /> Changes Made
                  </h4>
                  {formatChanges(
                    selectedLog.details?.before as Record<string, unknown>,
                    selectedLog.details?.after as Record<string, unknown>
                  ).length > 0 ? (
                    <div className="space-y-3">
                      {formatChanges(
                        selectedLog.details?.before as Record<string, unknown>,
                        selectedLog.details?.after as Record<string, unknown>
                      ).map((change, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                          <div className="text-xs font-medium text-muted-foreground mb-2">{change.field}</div>
                          <div className="flex items-center gap-2 text-sm flex-wrap">
                            <span className="px-2 py-1 rounded bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-xs">{change.from}</span>
                            <span className="text-muted-foreground">→</span>
                            <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs">{change.to}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : selectedLog.action_type === 'CREATE' && selectedLog.details?.after ? (
                    <div className="space-y-2">
                      {Object.entries(selectedLog.details.after as Record<string, unknown>).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center py-2 border-b border-border/30 last:border-0">
                          <span className="text-sm text-muted-foreground">{fieldLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                          <span className="text-sm font-medium text-foreground">{formatValue(key, value)}</span>
                        </div>
                      ))}
                    </div>
                  ) : selectedLog.action_type === 'DELETE' && selectedLog.details?.before ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                        <p className="text-sm text-red-600 dark:text-red-400 mb-3">Deleted record details:</p>
                        <div className="space-y-2">
                          {Object.entries(selectedLog.details.before as Record<string, unknown>).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center py-1">
                              <span className="text-xs text-muted-foreground">{fieldLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                              <span className="text-xs text-foreground">{formatValue(key, value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Restore Button for deleted students */}
                      {selectedLog.entity_type === 'STUDENT' && (
                        <Button
                          onClick={() => handleRestoreStudent(selectedLog)}
                          disabled={restoring}
                          className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          {restoring ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RotateCcw className="w-4 h-4" />
                          )}
                          {restoring ? 'Restoring...' : 'Restore This Student'}
                        </Button>
                      )}
                    </div>
                  ) : null}
                </div>
              )}

              {/* Security Info for LOGIN events */}
              {selectedLog.action_type === 'LOGIN' && (selectedLog.details?.ip_address || selectedLog.details?.browser) && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Security Info
                  </h4>
                  <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20 space-y-3">
                    {selectedLog.details?.ip_address && (
                      <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">IP Address</p>
                          <p className="text-sm font-mono text-foreground">{String(selectedLog.details.ip_address)}</p>
                        </div>
                      </div>
                    )}
                    {selectedLog.details?.browser && (
                      <div className="flex items-center gap-3">
                        <Monitor className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Browser & OS</p>
                          <p className="text-sm text-foreground">{String(selectedLog.details.browser)} on {String(selectedLog.details.os || 'Unknown')}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Details</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Log ID</dt>
                    <dd className="font-mono text-xs text-foreground">{selectedLog.id.slice(0, 8)}...</dd>
                  </div>
                  {selectedLog.entity_id && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Entity ID</dt>
                      <dd className="font-mono text-xs text-foreground">{selectedLog.entity_id.slice(0, 8)}...</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Timestamp</dt>
                    <dd className="text-foreground">{format(parseISO(selectedLog.created_at), 'PPpp')}</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
