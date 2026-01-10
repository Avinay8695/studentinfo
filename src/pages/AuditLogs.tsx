import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, formatDistanceToNow, isToday, isYesterday, isThisWeek, parseISO } from 'date-fns';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  LogIn, 
  Filter, 
  User, 
  GraduationCap, 
  CreditCard,
  ChevronRight,
  Calendar,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface AuditLog {
  id: string;
  created_at: string;
  action_type: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN';
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
  CREATE: {
    icon: Plus,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/30',
    label: 'Created',
  },
  UPDATE: {
    icon: Pencil,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30',
    label: 'Updated',
  },
  DELETE: {
    icon: Trash2,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30',
    label: 'Deleted',
  },
  LOGIN: {
    icon: LogIn,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/30',
    label: 'Logged In',
  },
};

const entityConfig = {
  STUDENT: { icon: GraduationCap, label: 'Student' },
  PAYMENT: { icon: CreditCard, label: 'Payment' },
  USER: { icon: User, label: 'User' },
};

// Month names in Hindi/English for payment display
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Human readable field labels
const fieldLabels: Record<string, string> = {
  full_name: 'Name',
  course: 'Course',
  batch: 'Batch',
  mobile_number: 'Mobile Number',
  fees_amount: 'Total Fees',
  fees_status: 'Payment Status',
  monthly_fee: 'Monthly Fee',
  duration_months: 'Course Duration',
  enrollment_date: 'Enrollment Date',
  is_paid: 'Payment Status',
  month: 'Month',
  year: 'Year',
  amount: 'Amount',
  paid_date: 'Paid Date',
};

// Format value for display
function formatValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return 'Not set';
  
  if (key === 'is_paid') {
    return value === true ? '✅ Paid' : '❌ Unpaid';
  }
  if (key === 'month' && typeof value === 'number') {
    return monthNames[value - 1] || `Month ${value}`;
  }
  if (key === 'fees_status') {
    const statusMap: Record<string, string> = {
      paid: '✅ Fully Paid',
      partial: '⏳ Partially Paid',
      pending: '❌ Pending'
    };
    return statusMap[value as string] || String(value);
  }
  if (key === 'fees_amount' || key === 'monthly_fee' || key === 'amount') {
    return `₹${Number(value).toLocaleString('en-IN')}`;
  }
  if (key === 'duration_months') {
    return `${value} months`;
  }
  if (key === 'enrollment_date' || key === 'paid_date') {
    try {
      return format(parseISO(value as string), 'dd MMM yyyy');
    } catch {
      return String(value);
    }
  }
  return String(value);
}

// Format changes for display
function formatChanges(before?: Record<string, unknown>, after?: Record<string, unknown>): { field: string; from: string; to: string }[] {
  if (!before && !after) return [];
  
  const changes: { field: string; from: string; to: string }[] = [];
  const allKeys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
  
  allKeys.forEach(key => {
    const beforeVal = before?.[key];
    const afterVal = after?.[key];
    
    if (JSON.stringify(beforeVal) !== JSON.stringify(afterVal)) {
      changes.push({
        field: fieldLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        from: formatValue(key, beforeVal),
        to: formatValue(key, afterVal)
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

export default function AuditLogs() {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAuth();
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['audit-logs', actionFilter, entityFilter],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (actionFilter !== 'all') {
        query = query.eq('action_type', actionFilter);
      }
      if (entityFilter !== 'all') {
        query = query.eq('entity_type', entityFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as AuditLog[];
    },
    enabled: isAdmin,
  });

  const groupedLogs = groupLogsByDate(logs);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">Only administrators can view audit logs.</p>
            <Button onClick={() => navigate('/')}>Go Back Home</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
      <Header />
      
      <main className="flex-1 container max-w-5xl mx-auto px-4 py-6 sm:py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Activity History</h1>
              <p className="text-muted-foreground mt-1">Track all changes and actions in your system</p>
            </div>
            <Badge variant="secondary" className="w-fit">
              <Clock className="w-3 h-3 mr-1" />
              {logs.length} activities
            </Badge>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-6 p-4 rounded-2xl bg-card/50 backdrop-blur-xl border border-border/50 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="w-4 h-4" />
              <span className="font-medium">Filters:</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[140px] h-10 bg-background/50">
                  <SelectValue placeholder="Action Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="CREATE">Create</SelectItem>
                  <SelectItem value="UPDATE">Update</SelectItem>
                  <SelectItem value="DELETE">Delete</SelectItem>
                  <SelectItem value="LOGIN">Login</SelectItem>
                </SelectContent>
              </Select>

              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="w-[140px] h-10 bg-background/50">
                  <SelectValue placeholder="Entity Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="PAYMENT">Payment</SelectItem>
                  <SelectItem value="USER">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Timeline */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No Activity Yet</h3>
            <p className="text-muted-foreground">Activities will appear here as you use the system.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-border via-border to-transparent" />

            {Object.entries(groupedLogs).map(([dateGroup, groupLogs], groupIndex) => (
              <div key={dateGroup} className="mb-8">
                {/* Date Group Header */}
                <div className="relative flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center z-10">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{dateGroup}</h3>
                </div>

                {/* Log Items */}
                <div className="space-y-3 ml-5 pl-8 border-l border-border/50">
                  {groupLogs.map((log, index) => {
                    const action = actionConfig[log.action_type];
                    const entity = entityConfig[log.entity_type];
                    const ActionIcon = action.icon;
                    const EntityIcon = entity.icon;

                    return (
                      <div
                        key={log.id}
                        onClick={() => setSelectedLog(log)}
                        className={cn(
                          "relative group cursor-pointer",
                          "p-4 rounded-xl",
                          "bg-card/40 backdrop-blur-md",
                          "border border-border/50",
                          "hover:bg-card/60 hover:border-border",
                          "transition-all duration-300",
                          "animate-fade-in"
                        )}
                        style={{ animationDelay: `${(groupIndex * 100) + (index * 50)}ms` }}
                      >
                        {/* Timeline Connector */}
                        <div className="absolute left-0 top-1/2 -translate-x-[calc(2rem+1px)] w-8 h-px bg-border/50" />
                        <div className={cn(
                          "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[calc(2rem+5px)]",
                          "w-2.5 h-2.5 rounded-full border-2",
                          action.bgColor,
                          action.borderColor
                        )} />

                        <div className="flex items-start gap-3">
                          {/* Action Icon */}
                          <div className={cn(
                            "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
                            action.bgColor,
                            "border",
                            action.borderColor
                          )}>
                            <ActionIcon className={cn("w-5 h-5", action.color)} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="font-semibold text-foreground">
                                {log.performed_by_name}
                              </span>
                              <Badge className="text-xs bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">
                                Admin
                              </Badge>
                              <Badge variant="outline" className={cn("text-xs", action.color, action.borderColor)}>
                                {action.label}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                <EntityIcon className="w-3 h-3 mr-1" />
                                {entity.label}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {log.details?.description || `${action.label} a ${entity.label.toLowerCase()}`}
                            </p>

                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{formatDistanceToNow(parseISO(log.created_at), { addSuffix: true })}</span>
                              <span>•</span>
                              <span>{format(parseISO(log.created_at), 'h:mm a')}</span>
                            </div>
                          </div>

                          {/* Arrow */}
                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Detail Sheet */}
      <Sheet open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              {selectedLog && (
                <>
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    actionConfig[selectedLog.action_type].bgColor,
                    "border",
                    actionConfig[selectedLog.action_type].borderColor
                  )}>
                    {(() => {
                      const Icon = actionConfig[selectedLog.action_type].icon;
                      return <Icon className={cn("w-4 h-4", actionConfig[selectedLog.action_type].color)} />;
                    })()}
                  </div>
                  <span>{actionConfig[selectedLog.action_type].label} {entityConfig[selectedLog.entity_type].label}</span>
                </>
              )}
            </SheetTitle>
            <SheetDescription>
              {selectedLog && (
                <span>
                  By {selectedLog.performed_by_name} • {format(parseISO(selectedLog.created_at), 'PPpp')}
                </span>
              )}
            </SheetDescription>
          </SheetHeader>

          {selectedLog && (
            <div className="mt-6 space-y-6">
              {/* Description */}
              {selectedLog.details?.description && (
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-foreground">{selectedLog.details.description}</p>
                </div>
              )}

              {/* Changes Summary - Human Readable */}
              {(selectedLog.details?.before || selectedLog.details?.after) && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Pencil className="w-4 h-4" />
                    Changes Made
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
                          <div className="text-xs font-medium text-muted-foreground mb-2">
                            {change.field}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                              {change.from}
                            </span>
                            <span className="text-muted-foreground">→</span>
                            <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {change.to}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : selectedLog.action_type === 'CREATE' && selectedLog.details?.after ? (
                    <div className="space-y-2">
                      {Object.entries(selectedLog.details.after as Record<string, unknown>).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center py-2 border-b border-border/30 last:border-0">
                          <span className="text-sm text-muted-foreground">
                            {fieldLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          <span className="text-sm font-medium text-foreground">
                            {formatValue(key, value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : selectedLog.action_type === 'DELETE' && selectedLog.details?.before ? (
                    <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                      <p className="text-sm text-red-400 mb-3">Deleted record details:</p>
                      <div className="space-y-2">
                        {Object.entries(selectedLog.details.before as Record<string, unknown>).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center py-1">
                            <span className="text-xs text-muted-foreground">
                              {fieldLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                            <span className="text-xs text-foreground">
                              {formatValue(key, value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Metadata */}
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
