import { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Upload, FileSpreadsheet, ClipboardPaste, CheckCircle2, XCircle, AlertTriangle, Download, Loader2, Trash2 } from 'lucide-react';
import { COURSES, getCourseByName } from '@/data/courses';
import { generateMonthlyPayments } from '@/hooks/useStudentsQuery';
import * as XLSX from 'xlsx';

interface ParsedStudent {
  fullName: string;
  course: string;
  batch: string;
  feesAmount: number;
  monthlyFee: number;
  courseDuration: number;
  enrollmentDate: string;
  feesStatus: 'paid' | 'not_paid';
  mobile: string;
  isValid: boolean;
  errors: string[];
}

interface BulkImportStudentsProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (students: any[], onProgress?: (current: number, total: number) => void) => Promise<any>;
}

const EXPECTED_HEADERS = ['Full Name', 'Course', 'Batch', 'Mobile', 'Enrollment Date', 'Fees Status'];

function validateStudent(row: Record<string, string>): ParsedStudent {
  const errors: string[] = [];
  const fullName = (row['Full Name'] || row['full_name'] || row['name'] || '').trim();
  const courseName = (row['Course'] || row['course'] || '').trim();
  const batch = (row['Batch'] || row['batch'] || '').trim();
  const mobile = (row['Mobile'] || row['mobile'] || row['mobile_number'] || row['phone'] || '').trim();
  const enrollmentDate = (row['Enrollment Date'] || row['enrollment_date'] || row['date'] || '').trim();
  const feesStatusRaw = (row['Fees Status'] || row['fees_status'] || row['status'] || 'not_paid').trim().toLowerCase();

  if (!fullName) errors.push('Name is required');
  if (!courseName) errors.push('Course is required');

  const course = getCourseByName(courseName);
  if (courseName && !course) {
    errors.push(`Unknown course: "${courseName}"`);
  }

  let parsedDate = enrollmentDate;
  if (enrollmentDate) {
    const d = new Date(enrollmentDate);
    if (isNaN(d.getTime())) {
      errors.push('Invalid date format');
      parsedDate = new Date().toISOString().split('T')[0];
    } else {
      parsedDate = d.toISOString().split('T')[0];
    }
  } else {
    parsedDate = new Date().toISOString().split('T')[0];
  }

  const feesStatus: 'paid' | 'not_paid' = feesStatusRaw === 'paid' ? 'paid' : 'not_paid';

  return {
    fullName,
    course: courseName,
    batch,
    feesAmount: course?.totalFee || 0,
    monthlyFee: course?.monthlyFee || 0,
    courseDuration: course?.durationMonths || 6,
    enrollmentDate: parsedDate,
    feesStatus,
    mobile,
    isValid: errors.length === 0,
    errors,
  };
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(/[,\t]/).map(h => h.trim().replace(/^"|"$/g, ''));
  
  return lines.slice(1).map(line => {
    const values = line.split(/[,\t]/).map(v => v.trim().replace(/^"|"$/g, ''));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] || ''; });
    return row;
  });
}

function parseXLSX(data: ArrayBuffer): Record<string, string>[] {
  const workbook = XLSX.read(data, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });
  return jsonData.map(row => {
    const stringRow: Record<string, string> = {};
    Object.keys(row).forEach(key => {
      stringRow[key] = String(row[key]);
    });
    return stringRow;
  });
}

function generateCSVTemplate(): string {
  return `Full Name,Course,Batch,Mobile,Enrollment Date,Fees Status
John Doe,Diploma in Computer Application,Morning,9876543210,2025-01-15,not_paid
Jane Smith,Certificate in Tally ERP9,Evening,9123456789,2025-02-01,paid`;
}

export function BulkImportStudents({ isOpen, onClose, onImport }: BulkImportStudentsProps) {
  const [tab, setTab] = useState<string>('upload');
  const [pasteText, setPasteText] = useState('');
  const [parsedStudents, setParsedStudents] = useState<ParsedStudent[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validCount = parsedStudents.filter(s => s.isValid).length;
  const invalidCount = parsedStudents.filter(s => !s.isValid).length;
  const progressPercent = importProgress.total > 0 ? Math.round((importProgress.current / importProgress.total) * 100) : 0;

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const data = ev.target?.result as ArrayBuffer;
        const rows = parseXLSX(data);
        if (rows.length === 0) {
          toast.error('No data found in the Excel file');
          return;
        }
        setParsedStudents(rows.map((row) => validateStudent(row)));
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const rows = parseCSV(text);
        setParsedStudents(rows.map((row) => validateStudent(row)));
      };
      reader.readAsText(file);
    }
  }, []);

  const handleParsePaste = useCallback(() => {
    if (!pasteText.trim()) {
      toast.error('Please paste some data first');
      return;
    }
    const rows = parseCSV(pasteText);
    if (rows.length === 0) {
      toast.error('No valid data found. Make sure first line is headers.');
      return;
    }
    setParsedStudents(rows.map((row) => validateStudent(row)));
  }, [pasteText]);

  const handleImport = async () => {
    const validStudents = parsedStudents.filter(s => s.isValid);
    if (validStudents.length === 0) {
      toast.error('No valid students to import');
      return;
    }

    setIsImporting(true);
    setImportProgress({ current: 0, total: validStudents.length });

    try {
      const studentsToAdd = validStudents.map(s => {
        const payments = generateMonthlyPayments(s.enrollmentDate, s.courseDuration, s.feesAmount);
        return {
          fullName: s.fullName,
          course: s.course,
          batch: s.batch,
          feesAmount: s.feesAmount,
          monthlyFee: s.monthlyFee,
          courseDuration: s.courseDuration,
          enrollmentDate: s.enrollmentDate,
          feesStatus: s.feesStatus,
          mobile: s.mobile,
          address: '',
          notes: '',
          monthlyPayments: payments,
        };
      });

      await onImport(studentsToAdd, (current, total) => {
        setImportProgress({ current, total });
      });
      toast.success(`${validStudents.length} students imported successfully! 🎉`);
      handleReset();
      onClose();
    } catch (err) {
      toast.error('Import failed. Please try again.');
    } finally {
      setIsImporting(false);
      setImportProgress({ current: 0, total: 0 });
    }
  };

  const handleReset = () => {
    setParsedStudents([]);
    setPasteText('');
    setFileName(null);
    setImportProgress({ current: 0, total: 0 });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownloadTemplate = () => {
    const csv = generateCSVTemplate();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const removeStudent = (index: number) => {
    setParsedStudents(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !isImporting) { handleReset(); onClose(); } }}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            Bulk Import Students
          </DialogTitle>
          <DialogDescription>
            CSV/Excel file upload ya data paste karke ek saath multiple students add karo
          </DialogDescription>
        </DialogHeader>

        {isImporting ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <div className="w-full max-w-sm space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Importing students...</span>
                <span className="text-primary">{importProgress.current}/{importProgress.total}</span>
              </div>
              <Progress value={progressPercent} className="h-3" />
              <p className="text-xs text-muted-foreground text-center">
                {progressPercent}% complete — please don't close this dialog
              </p>
            </div>
          </div>
        ) : parsedStudents.length === 0 ? (
          <Tabs value={tab} onValueChange={setTab} className="flex-1">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload" className="gap-2">
                <Upload className="w-4 h-4" /> File Upload
              </TabsTrigger>
              <TabsTrigger value="paste" className="gap-2">
                <ClipboardPaste className="w-4 h-4" /> Copy-Paste
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4 mt-4">
              <div
                className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center hover:border-primary/60 transition-colors cursor-pointer bg-primary/5"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-10 h-10 mx-auto mb-3 text-primary/60" />
                <p className="font-medium text-foreground">Click to upload CSV or Excel file</p>
                <p className="text-sm text-muted-foreground mt-1">Supports .csv, .txt, .xlsx, .xls files</p>
                {fileName && (
                  <Badge variant="secondary" className="mt-3">{fileName}</Badge>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt,.xlsx,.xls"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="w-full gap-2">
                <Download className="w-4 h-4" />
                Download CSV Template
              </Button>
            </TabsContent>

            <TabsContent value="paste" className="space-y-4 mt-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Paste tab-separated or comma-separated data. First row should be headers:
                </p>
                <div className="bg-muted/50 rounded-lg p-3 text-xs font-mono overflow-x-auto">
                  Full Name, Course, Batch, Mobile, Enrollment Date, Fees Status
                </div>
              </div>
              <Textarea
                placeholder={`Full Name,Course,Batch,Mobile,Enrollment Date,Fees Status\nRahul Kumar,Diploma in Computer Application,Morning,9876543210,2025-01-15,not_paid`}
                value={pasteText}
                onChange={e => setPasteText(e.target.value)}
                rows={8}
                className="font-mono text-sm"
              />
              <Button onClick={handleParsePaste} className="w-full gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Parse Data
              </Button>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex-1 flex flex-col gap-4 min-h-0">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="default" className="gap-1 bg-emerald-600 hover:bg-emerald-700">
                <CheckCircle2 className="w-3 h-3" />
                {validCount} Valid
              </Badge>
              {invalidCount > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <XCircle className="w-3 h-3" />
                  {invalidCount} Invalid
                </Badge>
              )}
              <span className="text-sm text-muted-foreground ml-auto">
                Total: {parsedStudents.length}
              </span>
            </div>

            <ScrollArea className="flex-1 max-h-[40vh] border rounded-lg">
              <div className="divide-y divide-border">
                {parsedStudents.map((student, idx) => (
                  <div
                    key={idx}
                    className={`p-3 flex items-start gap-3 ${
                      student.isValid ? 'bg-background' : 'bg-destructive/5'
                    }`}
                  >
                    <div className="mt-0.5">
                      {student.isValid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {student.fullName || '(No Name)'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {student.course} {student.batch && `• ${student.batch}`} {student.mobile && `• ${student.mobile}`}
                      </p>
                      {student.errors.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {student.errors.map((err, i) => (
                            <Badge key={i} variant="destructive" className="text-[10px] px-1.5 py-0">
                              {err}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => removeStudent(idx)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleImport}
                disabled={validCount === 0}
                className="flex-1 gap-2"
              >
                <Upload className="w-4 h-4" />
                Import {validCount} Students
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
