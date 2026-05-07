import type { Student } from '@/types/student';
import { generateWhatsAppReminderURL, openWhatsAppReminder } from './whatsappReminder';
import { exportToCSV, exportToJSON, generatePrintableReport } from './exportData';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export type ToolName =
  | 'find_student'
  | 'list_overdue_students'
  | 'top_defaulters'
  | 'get_course_stats'
  | 'send_whatsapp_reminder'
  | 'bulk_send_reminders'
  | 'mark_payment_paid'
  | 'open_student_profile'
  | 'export_data'
  | 'scroll_to_section';

export const WRITE_TOOLS: ToolName[] = [
  'send_whatsapp_reminder',
  'bulk_send_reminders',
  'mark_payment_paid',
  'open_student_profile',
  'export_data',
];

export interface ToolContext {
  students: Student[];
  updatePaymentStatus: (studentId: string, paymentIndex: number, isPaid: boolean, studentName?: string) => Promise<unknown>;
  openStudentPayments: (student: Student) => void;
  openStudentAnalytics: (student: Student) => void;
}

export function isWriteTool(name: string): boolean {
  return WRITE_TOOLS.includes(name as ToolName);
}

function getOverdueForStudent(s: Student) {
  const now = new Date();
  return (s.monthlyPayments || []).filter(
    p => !p.isPaid && (p.year < now.getFullYear() || (p.year === now.getFullYear() && p.month < now.getMonth()))
  );
}

function studentSummary(s: Student) {
  const overdue = getOverdueForStudent(s);
  const totalPending = overdue.reduce((a, p) => a + Number(p.amount || 0), 0);
  return {
    id: s.id,
    name: s.fullName,
    course: s.course,
    batch: s.batch,
    mobile: s.mobile,
    monthlyFee: s.monthlyFee,
    overdueMonths: overdue.length,
    overduePending: totalPending,
    feesStatus: s.feesStatus,
  };
}

export function summarizeAction(name: string, args: any, ctx: ToolContext): string {
  const s = args?.studentId ? ctx.students.find(x => x.id === args.studentId) : null;
  switch (name) {
    case 'send_whatsapp_reminder':
      return s ? `Send WhatsApp reminder to **${s.fullName}** (${s.mobile || 'no mobile'})` : 'Send WhatsApp reminder';
    case 'bulk_send_reminders': {
      const overdue = ctx.students.filter(st => getOverdueForStudent(st).length > 0 && st.mobile);
      return `Send WhatsApp reminders to **${overdue.length} overdue students**`;
    }
    case 'mark_payment_paid':
      return s ? `Mark **${MONTH_NAMES[args.month] || '?'} ${args.year}** as PAID for **${s.fullName}**` : 'Mark payment as paid';
    case 'open_student_profile':
      return s ? `Open ${args.view === 'analytics' ? 'analytics' : 'payment tracker'} for **${s.fullName}**` : 'Open student profile';
    case 'export_data':
      return `Export all student data as **${(args.format || 'csv').toUpperCase()}**`;
    default:
      return `Run action: ${name}`;
  }
}

export async function executeTool(
  name: string,
  args: any,
  ctx: ToolContext
): Promise<{ ok: boolean; data?: any; error?: string }> {
  try {
    switch (name) {
      case 'find_student': {
        const q = String(args?.query || '').toLowerCase().trim();
        if (!q) return { ok: false, error: 'Empty query' };
        const matches = ctx.students.filter(s =>
          s.fullName?.toLowerCase().includes(q) ||
          s.mobile?.toLowerCase().includes(q) ||
          s.course?.toLowerCase().includes(q) ||
          s.batch?.toLowerCase().includes(q)
        ).slice(0, 10).map(studentSummary);
        return { ok: true, data: { count: matches.length, matches } };
      }
      case 'list_overdue_students': {
        const limit = Number(args?.limit) || 20;
        const list = ctx.students
          .map(s => ({ s, overdue: getOverdueForStudent(s) }))
          .filter(x => x.overdue.length > 0)
          .sort((a, b) => b.overdue.length - a.overdue.length)
          .slice(0, limit)
          .map(x => studentSummary(x.s));
        return { ok: true, data: { count: list.length, students: list } };
      }
      case 'top_defaulters': {
        const count = Number(args?.count) || 5;
        const list = ctx.students
          .map(s => {
            const od = getOverdueForStudent(s);
            return { s, overdueAmount: od.reduce((a, p) => a + Number(p.amount || 0), 0), overdueMonths: od.length };
          })
          .filter(x => x.overdueAmount > 0)
          .sort((a, b) => b.overdueAmount - a.overdueAmount)
          .slice(0, count)
          .map(x => ({ ...studentSummary(x.s) }));
        return { ok: true, data: { count: list.length, defaulters: list } };
      }
      case 'get_course_stats': {
        const map = new Map<string, { students: number; revenue: number; collected: number; pending: number }>();
        for (const s of ctx.students) {
          const cur = map.get(s.course) || { students: 0, revenue: 0, collected: 0, pending: 0 };
          cur.students += 1;
          for (const p of s.monthlyPayments || []) {
            cur.revenue += Number(p.amount || 0);
            if (p.isPaid) cur.collected += Number(p.amount || 0);
            else cur.pending += Number(p.amount || 0);
          }
          map.set(s.course, cur);
        }
        const courses = [...map.entries()].map(([course, v]) => ({ course, ...v, collectionRate: v.revenue ? Math.round((v.collected / v.revenue) * 100) : 0 }));
        return { ok: true, data: { courses } };
      }
      case 'send_whatsapp_reminder': {
        const s = ctx.students.find(x => x.id === args.studentId);
        if (!s) return { ok: false, error: 'Student not found' };
        if (!s.mobile) return { ok: false, error: 'No mobile number' };
        const overdue = getOverdueForStudent(s);
        if (overdue.length === 0) return { ok: false, error: 'No overdue payments' };
        const total = overdue.reduce((a, p) => a + Number(p.amount || 0), 0);
        openWhatsAppReminder(s.fullName, s.mobile, overdue.map(p => ({ month: p.month, year: p.year, amount: Number(p.amount || 0) })), total);
        return { ok: true, data: { sentTo: s.fullName, mobile: s.mobile, totalPending: total } };
      }
      case 'bulk_send_reminders': {
        const list = ctx.students.filter(s => s.mobile && getOverdueForStudent(s).length > 0);
        const links = list.map(s => {
          const od = getOverdueForStudent(s);
          const total = od.reduce((a, p) => a + Number(p.amount || 0), 0);
          return {
            name: s.fullName,
            mobile: s.mobile,
            url: generateWhatsAppReminderURL(s.fullName, s.mobile, od.map(p => ({ month: p.month, year: p.year, amount: Number(p.amount || 0) })), total),
          };
        });
        // Open first one immediately; rest as links list (browsers block multiple popups)
        if (links[0]) window.open(links[0].url, '_blank');
        return { ok: true, data: { total: links.length, openedFirst: links[0]?.name, links } };
      }
      case 'mark_payment_paid': {
        const s = ctx.students.find(x => x.id === args.studentId);
        if (!s) return { ok: false, error: 'Student not found' };
        const idx = (s.monthlyPayments || []).findIndex(p => p.month === Number(args.month) && p.year === Number(args.year));
        if (idx === -1) return { ok: false, error: 'Payment month not found' };
        if (s.monthlyPayments[idx].isPaid) return { ok: false, error: 'Already paid' };
        await ctx.updatePaymentStatus(s.id, idx, true, s.fullName);
        return { ok: true, data: { student: s.fullName, marked: `${MONTH_NAMES[Number(args.month)]} ${args.year}` } };
      }
      case 'open_student_profile': {
        const s = ctx.students.find(x => x.id === args.studentId);
        if (!s) return { ok: false, error: 'Student not found' };
        if (args.view === 'analytics') ctx.openStudentAnalytics(s); else ctx.openStudentPayments(s);
        return { ok: true, data: { opened: s.fullName, view: args.view || 'payments' } };
      }
      case 'export_data': {
        const fmt = String(args?.format || 'csv').toLowerCase();
        if (fmt === 'csv') exportToCSV(ctx.students);
        else if (fmt === 'json') exportToJSON(ctx.students);
        else if (fmt === 'pdf') generatePrintableReport(ctx.students);
        else return { ok: false, error: 'Unsupported format' };
        return { ok: true, data: { format: fmt, total: ctx.students.length } };
      }
      case 'scroll_to_section': {
        const id = String(args?.section || '');
        const el = document.getElementById(id);
        if (!el) return { ok: false, error: 'Section not found' };
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return { ok: true, data: { scrolledTo: id } };
      }
      default:
        return { ok: false, error: `Unknown tool: ${name}` };
    }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Tool failed' };
  }
}