const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function formatPhoneForWhatsApp(mobile: string): string {
  let cleaned = mobile.replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  return cleaned;
}

interface OverdueMonth {
  month: number;
  year: number;
  amount: number;
}

export function generateWhatsAppReminderURL(
  studentName: string,
  mobile: string,
  overdueMonths: OverdueMonth[],
  totalPending: number
): string {
  const phone = formatPhoneForWhatsApp(mobile);
  
  const monthList = overdueMonths
    .map(m => `• ${MONTH_NAMES[m.month]} ${m.year} — ₹${m.amount}`)
    .join('\n');

  const message = `🔔 *Fee Payment Reminder*

Dear ${studentName},

This is a gentle reminder that your following monthly fee payments are pending:

${monthList}

💰 *Total Pending: ₹${totalPending}*

Kindly clear the dues at your earliest convenience. If already paid, please ignore this message.

Thank you! 🙏`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function openWhatsAppReminder(
  studentName: string,
  mobile: string,
  overdueMonths: OverdueMonth[],
  totalPending: number
): boolean {
  if (!mobile) return false;
  const url = generateWhatsAppReminderURL(studentName, mobile, overdueMonths, totalPending);
  window.open(url, '_blank');
  return true;
}
