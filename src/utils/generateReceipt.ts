import logoImg from '@/assets/logo-success-desirous.jpg';

interface ReceiptData {
  studentName: string;
  course: string;
  batch?: string;
  monthName: string;
  year: number;
  amount: number;
  paidDate: string;
  receiptNo: string;
}

export function generatePaymentReceipt(data: ReceiptData) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payment Receipt - ${data.receiptNo}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          min-height: 100vh;
          padding: 30px;
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }
        .receipt {
          width: 500px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          position: relative;
        }
        .receipt::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: linear-gradient(90deg, #1e3a5f, #3b82f6, #1e3a5f);
        }
        .header {
          background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%);
          color: white;
          padding: 25px;
          text-align: center;
          position: relative;
        }
        .logo-container {
          width: 80px;
          height: 80px;
          margin: 0 auto 15px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }
        .logo-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .institute-name {
          font-size: 24px;
          font-weight: 700;
          background: linear-gradient(90deg, #ffd700, #ffc107);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 3px;
        }
        .institute-subtitle {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.8);
        }
        .receipt-badge {
          position: absolute;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }
        .content {
          padding: 30px;
        }
        .receipt-title {
          text-align: center;
          margin-bottom: 25px;
        }
        .receipt-title h2 {
          font-size: 18px;
          color: #1e293b;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .receipt-title h2::before,
        .receipt-title h2::after {
          content: '';
          width: 40px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #3b82f6);
        }
        .receipt-title h2::after {
          background: linear-gradient(90deg, #3b82f6, transparent);
        }
        .receipt-number {
          font-size: 12px;
          color: #64748b;
          margin-top: 5px;
        }
        .details-grid {
          display: grid;
          gap: 15px;
          margin-bottom: 25px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #f8fafc;
          border-radius: 12px;
          border-left: 4px solid #3b82f6;
        }
        .detail-label {
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
        }
        .detail-value {
          font-size: 14px;
          color: #1e293b;
          font-weight: 600;
        }
        .amount-section {
          background: linear-gradient(135deg, #ecfdf5, #d1fae5);
          border-radius: 16px;
          padding: 25px;
          text-align: center;
          margin-bottom: 25px;
          border: 2px solid #10b981;
          position: relative;
          overflow: hidden;
        }
        .amount-section::before {
          content: '₹';
          position: absolute;
          right: -20px;
          bottom: -30px;
          font-size: 150px;
          color: rgba(16, 185, 129, 0.1);
          font-weight: 700;
        }
        .amount-label {
          font-size: 12px;
          color: #047857;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
          font-weight: 600;
        }
        .amount-value {
          font-size: 42px;
          font-weight: 700;
          color: #047857;
          font-family: 'Courier New', monospace;
          position: relative;
        }
        .paid-for {
          font-size: 13px;
          color: #059669;
          margin-top: 10px;
          font-weight: 500;
        }
        .stamp {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }
        .stamp-content {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border-radius: 30px;
          font-weight: 600;
          font-size: 14px;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .stamp-icon {
          width: 24px;
          height: 24px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #10b981;
          font-weight: 700;
        }
        .footer {
          background: #f8fafc;
          padding: 20px;
          text-align: center;
          border-top: 1px dashed #cbd5e1;
        }
        .footer-text {
          font-size: 11px;
          color: #64748b;
          line-height: 1.6;
        }
        .footer-brand {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 12px;
        }
        .footer-logo {
          width: 25px;
          height: 25px;
          border-radius: 50%;
          overflow: hidden;
        }
        .footer-logo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .footer-name {
          font-size: 12px;
          font-weight: 600;
          color: #1e3a5f;
        }
        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-30deg);
          font-size: 100px;
          font-weight: 700;
          color: rgba(16, 185, 129, 0.05);
          pointer-events: none;
          white-space: nowrap;
        }
        @media print {
          body { background: white; padding: 0; }
          .receipt { box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="watermark">PAID</div>
        
        <div class="header">
          <div class="receipt-badge">✓ Verified</div>
          <div class="logo-container">
            <img src="${logoImg}" alt="Success Desirous Logo" />
          </div>
          <div class="institute-name">SUCCESS DESIROUS</div>
          <div class="institute-subtitle">Computer Institute</div>
        </div>
        
        <div class="content">
          <div class="receipt-title">
            <h2>Payment Receipt</h2>
            <div class="receipt-number">Receipt No: ${data.receiptNo}</div>
          </div>
          
          <div class="details-grid">
            <div class="detail-row">
              <span class="detail-label">Student Name</span>
              <span class="detail-value">${data.studentName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Course</span>
              <span class="detail-value">${data.course}</span>
            </div>
            ${data.batch ? `
            <div class="detail-row">
              <span class="detail-label">Batch</span>
              <span class="detail-value">${data.batch}</span>
            </div>
            ` : ''}
            <div class="detail-row">
              <span class="detail-label">Payment Date</span>
              <span class="detail-value">${data.paidDate}</span>
            </div>
          </div>
          
          <div class="amount-section">
            <div class="amount-label">Amount Paid</div>
            <div class="amount-value">₹${data.amount.toLocaleString('en-IN')}</div>
            <div class="paid-for">For ${data.monthName} ${data.year}</div>
          </div>
          
          <div class="stamp">
            <div class="stamp-content">
              <div class="stamp-icon">✓</div>
              Payment Successful
            </div>
          </div>
        </div>
        
        <div class="footer">
          <div class="footer-text">
            This is a computer-generated receipt and does not require a signature.<br>
            For any queries, please contact the institute administration.
          </div>
          <div class="footer-brand">
            <div class="footer-logo">
              <img src="${logoImg}" alt="Logo" />
            </div>
            <div class="footer-name">Success Desirous Computer Institute</div>
          </div>
        </div>
      </div>
      
      <script>
        setTimeout(() => window.print(), 500);
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function generateReceiptFromPayment(
  studentName: string,
  course: string,
  batch: string | undefined,
  month: number, // 0-indexed
  year: number,
  amount: number,
  paidDate: string
) {
  const receiptNo = `SD${year}${String(month + 1).padStart(2, '0')}${Date.now().toString().slice(-6)}`;
  const formattedDate = new Date(paidDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  generatePaymentReceipt({
    studentName,
    course,
    batch,
    monthName: MONTH_NAMES[month],
    year,
    amount,
    paidDate: formattedDate,
    receiptNo
  });
}