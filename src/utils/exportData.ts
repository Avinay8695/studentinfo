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

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Student Report - Success Desirous | ${new Date().toLocaleDateString('en-IN')}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          padding: 30px;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          min-height: 100vh;
        }
        .container {
          max-width: 1000px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%);
          color: white;
          padding: 30px 40px;
          display: flex;
          align-items: center;
          gap: 25px;
        }
        .logo-container {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid rgba(255, 255, 255, 0.3);
          flex-shrink: 0;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }
        .logo-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .header-text h1 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 5px;
          background: linear-gradient(90deg, #ffd700, #ffc107);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .header-text p {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
        }
        .header-text .subtitle {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.9);
          margin-top: 2px;
        }
        .content { padding: 30px 40px; }
        .report-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e2e8f0;
        }
        .report-title {
          font-size: 20px;
          font-weight: 600;
          color: #1e293b;
        }
        .report-date {
          font-size: 13px;
          color: #64748b;
          background: #f1f5f9;
          padding: 8px 16px;
          border-radius: 20px;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin-bottom: 30px;
        }
        .summary-card {
          padding: 20px;
          border-radius: 12px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .summary-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }
        .summary-card.students { 
          background: linear-gradient(135deg, #eff6ff, #dbeafe); 
        }
        .summary-card.students::before { background: #3b82f6; }
        .summary-card.collected { 
          background: linear-gradient(135deg, #ecfdf5, #d1fae5); 
        }
        .summary-card.collected::before { background: #10b981; }
        .summary-card.pending { 
          background: linear-gradient(135deg, #fef2f2, #fecaca); 
        }
        .summary-card.pending::before { background: #ef4444; }
        .summary-card.rate { 
          background: linear-gradient(135deg, #f5f3ff, #ede9fe); 
        }
        .summary-card.rate::before { background: #8b5cf6; }
        .summary-value {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 5px;
        }
        .summary-card.students .summary-value { color: #2563eb; }
        .summary-card.collected .summary-value { color: #059669; }
        .summary-card.pending .summary-value { color: #dc2626; }
        .summary-card.rate .summary-value { color: #7c3aed; }
        .summary-label {
          font-size: 12px;
          font-weight: 500;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        thead th {
          background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%);
          color: white;
          padding: 14px 12px;
          text-align: left;
          font-weight: 600;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        thead th:first-child { border-radius: 8px 0 0 0; }
        thead th:last-child { border-radius: 0 8px 0 0; }
        tbody tr { transition: background 0.2s; }
        tbody tr:nth-child(even) { background: #f8fafc; }
        tbody tr:hover { background: #f1f5f9; }
        tbody td {
          padding: 12px;
          border-bottom: 1px solid #e2e8f0;
          color: #334155;
        }
        .student-name {
          font-weight: 600;
          color: #1e293b;
        }
        .course-badge {
          display: inline-block;
          background: #e0f2fe;
          color: #0369a1;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 500;
        }
        .amount { font-family: 'Courier New', monospace; font-weight: 600; }
        .amount.paid { color: #059669; }
        .amount.pending { color: #dc2626; }
        .status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }
        .status-paid {
          background: linear-gradient(135deg, #d1fae5, #a7f3d0);
          color: #047857;
        }
        .status-pending {
          background: linear-gradient(135deg, #fee2e2, #fecaca);
          color: #b91c1c;
        }
        .status-icon {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .status-paid .status-icon { background: #10b981; }
        .status-pending .status-icon { background: #ef4444; }
        .footer {
          background: #f8fafc;
          padding: 20px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid #e2e8f0;
        }
        .footer-left {
          font-size: 11px;
          color: #64748b;
        }
        .footer-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .footer-logo {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          overflow: hidden;
        }
        .footer-logo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .footer-brand {
          font-size: 13px;
          font-weight: 600;
          color: #1e3a5f;
        }
        @media print {
          body { background: white; padding: 0; }
          .container { box-shadow: none; border-radius: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-container">
            <img src="${logoImg}" alt="Success Desirous Logo" />
          </div>
          <div class="header-text">
            <h1>SUCCESS DESIROUS</h1>
            <p class="subtitle">Computer Institute</p>
            <p>Empowering Education Through Technology</p>
          </div>
        </div>
        
        <div class="content">
          <div class="report-info">
            <div class="report-title">📊 Student Report</div>
            <div class="report-date">Generated: ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>

          <div class="summary-grid">
            <div class="summary-card students">
              <div class="summary-value">${students.length}</div>
              <div class="summary-label">Total Students</div>
            </div>
            <div class="summary-card collected">
              <div class="summary-value">₹${paidFees.toLocaleString('en-IN')}</div>
              <div class="summary-label">Collected</div>
            </div>
            <div class="summary-card pending">
              <div class="summary-value">₹${pendingFees.toLocaleString('en-IN')}</div>
              <div class="summary-label">Pending</div>
            </div>
            <div class="summary-card rate">
              <div class="summary-value">${collectionRate}%</div>
              <div class="summary-label">Collection Rate</div>
            </div>
          </div>

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
                    <td class="student-name">${escapeHtml(s.fullName)}</td>
                    <td><span class="course-badge">${escapeHtml(s.course)}</span></td>
                    <td>${escapeHtml(s.batch) || '-'}</td>
                    <td class="amount">₹${s.feesAmount.toLocaleString('en-IN')}</td>
                    <td class="amount paid">₹${paid.toLocaleString('en-IN')}</td>
                    <td class="amount pending">₹${pending.toLocaleString('en-IN')}</td>
                    <td>
                      <span class="status ${s.feesStatus === 'paid' ? 'status-paid' : 'status-pending'}">
                        <span class="status-icon"></span>
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
          <div class="footer-left">
            This report is auto-generated by Success Desirous Student Management System<br>
            © ${new Date().getFullYear()} Success Desirous Computer Institute. All rights reserved.
          </div>
          <div class="footer-right">
            <div class="footer-logo">
              <img src="${logoImg}" alt="Logo" />
            </div>
            <div class="footer-brand">Success Desirous</div>
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