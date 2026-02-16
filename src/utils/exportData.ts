import { Student } from '@/types/student';
import logoImg from '@/assets/logo-success-desirous.jpg';
import { escapeHtml } from './htmlEscape';

export function exportToCSV(students: Student[], filename: string = 'students_data') {
  // Define headers
  const headers = [
    'S.No',
    'Full Name',
    'Course',
    'Batch',
    'Total Fees',
    'Monthly Fee',
    'Duration (Months)',
    'Enrollment Date',
    'Fees Status',
    'Paid Amount',
    'Pending Amount',
    'Mobile',
    'Payment Progress',
  ];

  // Create rows
  const rows = students.map((student, index) => {
    const paidAmount = student.monthlyPayments
      ?.filter(p => p.isPaid)
      .reduce((sum, p) => sum + p.amount, 0) || 0;
    
    const totalFromPayments = student.monthlyPayments
      ?.reduce((sum, p) => sum + p.amount, 0) || student.feesAmount;
    
    const pendingAmount = totalFromPayments - paidAmount;
    
    const paidCount = student.monthlyPayments?.filter(p => p.isPaid).length || 0;
    const totalMonths = student.monthlyPayments?.length || 0;
    const progress = totalMonths > 0 ? `${paidCount}/${totalMonths} months` : 'N/A';

    return [
      index + 1,
      student.fullName,
      student.course,
      student.batch || '',
      student.feesAmount,
      student.monthlyFee,
      student.courseDuration,
      student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString('en-IN') : '',
      student.feesStatus === 'paid' ? 'Paid' : 'Pending',
      paidAmount,
      pendingAmount,
      student.mobile || '',
      progress,
    ];
  });

  // Convert to CSV string
  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      row.map(cell => {
        // Escape cells containing commas or quotes
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    )
  ].join('\n');

  // Create and download file
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJSON(students: Student[], filename: string = 'students_data') {
  const exportData = students.map((student, index) => ({
    sno: index + 1,
    fullName: student.fullName,
    course: student.course,
    batch: student.batch,
    totalFees: student.feesAmount,
    monthlyFee: student.monthlyFee,
    durationMonths: student.courseDuration,
    enrollmentDate: student.enrollmentDate,
    feesStatus: student.feesStatus,
    mobile: student.mobile,
    monthlyPayments: student.monthlyPayments,
    createdAt: student.createdAt,
    updatedAt: student.updatedAt,
  }));

  const jsonContent = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generatePrintableReport(students: Student[]) {
  const totalFees = students.reduce((sum, s) => sum + s.feesAmount, 0);
  const paidFees = students.reduce((sum, s) => {
    const paid = s.monthlyPayments?.filter(p => p.isPaid).reduce((pSum, p) => pSum + p.amount, 0) || 0;
    return sum + paid;
  }, 0);
  const pendingFees = totalFees - paidFees;
  const collectionRate = totalFees > 0 ? Math.round((paidFees / totalFees) * 100) : 0;

  const reportDate = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const reportYear = new Date().getFullYear();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Student Report - Success Desirous | ${new Date().toLocaleDateString('en-IN')}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" />
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
          font-family: 'Inter', 'Segoe UI', sans-serif; 
          padding: 0;
          background: #f1f5f9;
          min-height: 100vh;
          color: #1e293b;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .page {
          max-width: 960px;
          margin: 20px auto;
          background: white;
          box-shadow: 0 4px 40px rgba(0,0,0,0.08);
          overflow: hidden;
        }

        /* ─── Header ─── */
        .header {
          background: #0f172a;
          color: white;
          padding: 32px 40px;
          display: flex;
          align-items: center;
          gap: 24px;
          position: relative;
          overflow: hidden;
        }
        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -10%;
          width: 300px;
          height: 300px;
          background: rgba(59, 130, 246, 0.08);
          border-radius: 50%;
        }
        .header::after {
          content: '';
          position: absolute;
          bottom: -60%;
          right: 15%;
          width: 200px;
          height: 200px;
          background: rgba(234, 179, 8, 0.06);
          border-radius: 50%;
        }
        .logo-wrap {
          width: 72px;
          height: 72px;
          border-radius: 14px;
          overflow: hidden;
          flex-shrink: 0;
          border: 2px solid rgba(255,255,255,0.15);
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .logo-wrap img { width: 100%; height: 100%; object-fit: cover; }
        .header-info { position: relative; z-index: 1; }
        .header-info h1 {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 26px;
          font-weight: 800;
          letter-spacing: 1.5px;
          color: #fbbf24;
          margin-bottom: 4px;
        }
        .header-info .tagline {
          font-size: 15px;
          font-weight: 600;
          color: #e2e8f0;
          letter-spacing: 0.3px;
        }
        .header-info .desc {
          font-size: 12px;
          color: #94a3b8;
          margin-top: 2px;
        }

        /* ─── Report Title Bar ─── */
        .title-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 40px;
          border-bottom: 2px solid #e2e8f0;
          background: #f8fafc;
        }
        .title-bar h2 {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
        }
        .title-bar .date {
          font-size: 12px;
          color: #64748b;
          background: white;
          border: 1px solid #e2e8f0;
          padding: 6px 14px;
          border-radius: 6px;
          font-weight: 500;
        }

        /* ─── Summary Cards ─── */
        .summary {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          padding: 24px 40px;
        }
        .card {
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 18px 16px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
        }
        .card.blue { background: #f0f9ff; }
        .card.blue::before { background: #3b82f6; }
        .card.green { background: #f0fdf4; }
        .card.green::before { background: #22c55e; }
        .card.red { background: #fef2f2; }
        .card.red::before { background: #ef4444; }
        .card.purple { background: #faf5ff; }
        .card.purple::before { background: #a855f7; }
        .card-value {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 24px;
          font-weight: 800;
          line-height: 1.2;
        }
        .card.blue .card-value { color: #2563eb; }
        .card.green .card-value { color: #16a34a; }
        .card.red .card-value { color: #dc2626; }
        .card.purple .card-value { color: #9333ea; }
        .card-label {
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-top: 4px;
        }

        /* ─── Table ─── */
        .table-wrap { padding: 0 40px 24px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        thead th {
          background: #0f172a;
          color: white;
          padding: 12px 10px;
          text-align: left;
          font-weight: 600;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }
        thead th:first-child { border-radius: 8px 0 0 0; }
        thead th:last-child { border-radius: 0 8px 0 0; }
        tbody tr { border-bottom: 1px solid #f1f5f9; }
        tbody tr:nth-child(even) { background: #fafbfc; }
        tbody td { padding: 11px 10px; color: #334155; }
        .name { font-weight: 700; color: #0f172a; }
        .course-tag {
          display: inline-block;
          background: #dbeafe;
          color: #1d4ed8;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
        }
        .money { font-family: 'Inter', monospace; font-weight: 700; font-variant-numeric: tabular-nums; }
        .money.green { color: #16a34a; }
        .money.red { color: #dc2626; }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.3px;
        }
        .badge.paid { background: #dcfce7; color: #15803d; }
        .badge.pending { background: #fee2e2; color: #b91c1c; }
        .badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          display: inline-block;
        }
        .badge.paid .badge-dot { background: #22c55e; }
        .badge.pending .badge-dot { background: #ef4444; }

        /* ─── Footer ─── */
        .footer {
          background: #0f172a;
          color: #94a3b8;
          padding: 20px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
        }
        .footer-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .footer-logo {
          width: 28px; height: 28px;
          border-radius: 6px;
          overflow: hidden;
        }
        .footer-logo img { width: 100%; height: 100%; object-fit: cover; }
        .footer-name {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 700;
          color: #fbbf24;
          font-size: 13px;
        }
        .footer-text { text-align: right; line-height: 1.6; }

        @media print {
          body { background: white; padding: 0; }
          .page { box-shadow: none; margin: 0; }
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="header">
          <div class="logo-wrap">
            <img src="${logoImg}" alt="Logo" />
          </div>
          <div class="header-info">
            <h1>SUCCESS DESIROUS</h1>
            <div class="tagline">Computer Institute</div>
            <div class="desc">Empowering Education Through Technology</div>
          </div>
        </div>

        <div class="title-bar">
          <h2>📊 Student Report</h2>
          <div class="date">${reportDate}</div>
        </div>

        <div class="summary">
          <div class="card blue">
            <div class="card-value">${students.length}</div>
            <div class="card-label">Total Students</div>
          </div>
          <div class="card green">
            <div class="card-value">₹${paidFees.toLocaleString('en-IN')}</div>
            <div class="card-label">Collected</div>
          </div>
          <div class="card red">
            <div class="card-value">₹${pendingFees.toLocaleString('en-IN')}</div>
            <div class="card-label">Pending</div>
          </div>
          <div class="card purple">
            <div class="card-value">${collectionRate}%</div>
            <div class="card-label">Collection Rate</div>
          </div>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Student Name</th>
                <th>Course</th>
                <th>Batch</th>
                <th>Total Fees</th>
                <th>Paid</th>
                <th>Pending</th>
                <th>Status</th>
                <th>Mobile</th>
              </tr>
            </thead>
            <tbody>
              ${students.map((s, i) => {
                const paid = s.monthlyPayments?.filter(p => p.isPaid).reduce((sum, p) => sum + p.amount, 0) || 0;
                const pending = s.feesAmount - paid;
                return `
                  <tr>
                    <td>${i + 1}</td>
                    <td class="name">${escapeHtml(s.fullName)}</td>
                    <td><span class="course-tag">${escapeHtml(s.course)}</span></td>
                    <td>${escapeHtml(s.batch) || '-'}</td>
                    <td class="money">₹${s.feesAmount.toLocaleString('en-IN')}</td>
                    <td class="money green">₹${paid.toLocaleString('en-IN')}</td>
                    <td class="money red">₹${pending.toLocaleString('en-IN')}</td>
                    <td>
                      <span class="badge ${s.feesStatus === 'paid' ? 'paid' : 'pending'}">
                        <span class="badge-dot"></span>
                        ${s.feesStatus === 'paid' ? 'PAID' : 'PENDING'}
                      </span>
                    </td>
                    <td>${escapeHtml(s.mobile) || '-'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <div class="footer-brand">
            <div class="footer-logo">
              <img src="${logoImg}" alt="Logo" />
            </div>
            <div class="footer-name">Success Desirous</div>
          </div>
          <div class="footer-text">
            Auto-generated by Success Desirous Student Management System<br>
            © ${reportYear} Success Desirous Computer Institute. All rights reserved.
          </div>
        </div>
      </div>

      <script>window.print();</script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}