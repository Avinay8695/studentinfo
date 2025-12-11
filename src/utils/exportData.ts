import { Student } from '@/types/student';

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

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Student Report - ${new Date().toLocaleDateString('en-IN')}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { text-align: center; color: #333; }
        .summary { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px; }
        .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
        .summary-item { text-align: center; }
        .summary-value { font-size: 24px; font-weight: bold; color: #3b82f6; }
        .summary-label { font-size: 12px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px; }
        th { background: #3b82f6; color: white; }
        tr:nth-child(even) { background: #f9f9f9; }
        .status-paid { color: #22c55e; font-weight: bold; }
        .status-pending { color: #ef4444; font-weight: bold; }
        .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #999; }
        @media print { .no-print { display: none; } }
      </style>
    </head>
    <body>
      <h1>Student Management System</h1>
      <p style="text-align: center; color: #666;">Computer Training Institute</p>
      
      <div class="summary">
        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-value">${students.length}</div>
            <div class="summary-label">Total Students</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">${students.filter(s => s.feesStatus === 'paid').length}</div>
            <div class="summary-label">Fees Paid</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">₹${totalFees.toLocaleString('en-IN')}</div>
            <div class="summary-label">Total Fees</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">₹${paidFees.toLocaleString('en-IN')}</div>
            <div class="summary-label">Collected</div>
          </div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
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
                <td>${s.fullName}</td>
                <td>${s.course}</td>
                <td>${s.batch || '-'}</td>
                <td>₹${s.feesAmount.toLocaleString('en-IN')}</td>
                <td>₹${paid.toLocaleString('en-IN')}</td>
                <td>₹${pending.toLocaleString('en-IN')}</td>
                <td class="${s.feesStatus === 'paid' ? 'status-paid' : 'status-pending'}">
                  ${s.feesStatus === 'paid' ? 'PAID' : 'PENDING'}
                </td>
                <td>${s.mobile || '-'}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <div class="footer">
        Generated on ${new Date().toLocaleString('en-IN')} | Student Management System
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
