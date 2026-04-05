import { useState, useRef, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Upload, FileSpreadsheet, ClipboardPaste, CheckCircle2, XCircle, AlertTriangle, Download, Loader2, Trash2, Copy, Users } from 'lucide-react';
import { COURSES, getCourseByName } from '@/data/courses';
import { generateMonthlyPayments } from '@/hooks/useStudentsQuery';
import { Student } from '@/types/student';
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
  warnings: string[];
  isDuplicate: boolean;
}

interface BulkImportStudentsProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (students: any[], onProgress?: (current: number, total: number) => void) => Promise<any>;
  existingStudents?: Student[];
}

const EXPECTED_HEADERS = ['Full Name', 'Course', 'Batch', 'Mobile', 'Enrollment Date', 'Fees Status'];

function checkDuplicate(fullName: string, course: string, existingStudents: Student[]): boolean {
  const normalizedName = fullName.toLowerCase().trim();
  const normalizedCourse = course.toLowerCase().trim();
  return existingStudents.some(
    s => s.fullName.toLowerCase().trim() === normalizedName && s.course.toLowerCase().trim() === normalizedCourse
  );
}

function validateStudent(row: Record<string, string>, existingStudents: Student[]): ParsedStudent {
  const errors: string[] = [];
  const warnings: string[] = [];
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

  // Duplicate check
  const isDuplicate = fullName && courseName ? checkDuplicate(fullName, courseName, existingStudents) : false;
  if (isDuplicate) {
    warnings.push('Student with same name & course already exists');
  }

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
    warnings,
    isDuplicate,
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
    Object.keys(row).forEach(key => { stringRow[key] = String(row[key]); });
    return stringRow;
  });
}

function generateCSVTemplate(): string {
  return `Full Name,Course,Batch,Mobile,Enrollment Date,Fees Status
John Doe,Diploma in Computer Application,Morning,9876543210,2025-01-15,not_paid
Jane Smith,Certificate in Tally ERP9,Evening,9123456789,2025-02-01,paid`;
}

export function BulkImportStudents({ isOpen, onClose, onImport, existingStudents = [] }: BulkImportStudentsProps) {
  const [tab, setTab] = useState<string>('upload');
  const [pasteText, setPasteText] = useState('');
  const [parsedStudents, setParsedStudents] = useState<ParsedStudent[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validCount = parsedStudents.filter(s => s.isValid).length;
  const invalidCount = parsedStudents.filter(s => !s.isValid).length;
  const duplicateCount = parsedStudents.filter(s => s.isDuplicate && s.isValid).length;
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
        if (rows.length === 0) { toast.error('No data found in the Excel file'); return; }
        setParsedStudents(rows.map((row) => validateStudent(row, existingStudents)));
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const rows = parseCSV(text);
        setParsedStudents(rows.map((row) => validateStudent(row, existingStudents)));
      };
      reader.readAsText(file);
    }
  }, [existingStudents]);

  const handleParsePaste = useCallback(() => {
    if (!pasteText.trim()) { toast.error('Please paste some data first'); return; }
    const rows = parseCSV(pasteText);
    if (rows.length === 0) { toast.error('No valid data found. Make sure first line is headers.'); return; }
    setParsedStudents(rows.map((row) => validateStudent(row, existingStudents)));
  }, [pasteText, existingStudents]);

  const handleImport = async () => {
    const validStudents = parsedStudents.filter(s => s.isValid);
    if (validStudents.length === 0) { toast.error('No valid students to import'); return; }

    setIsImporting(true);
    setImportProgress({ current: 0, total: validStudents.length });

    try {
      const studentsToAdd = validStudents.map(s => {
        const payments = generateMonthlyPayments(s.enrollmentDate, s.courseDuration, s.feesAmount);
        return {
          fullName: s.fullName, course: s.course, batch: s.batch,
          feesAmount: s.feesAmount, monthlyFee: s.monthlyFee, courseDuration: s.courseDuration,
          enrollmentDate: s.enrollmentDate, feesStatus: s.feesStatus, mobile: s.mobile,
          address: '', notes: '', monthlyPayments: payments,
        };
      });
      await onImport(studentsToAdd, (current, total) => setImportProgress({ current, total }));
      toast.success(`${validStudents.length} students imported successfully! 🎉`);
      handleReset();
      onClose();
    } catch {
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
    a.href = url; a.download = 'student_import_template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const removeStudent = (index: number) => {
    setParsedStudents(prev => prev.filter((_, i) => i !== index));
  };

  const removeDuplicates = () => {
    setParsedStudents(prev => prev.filter(s => !s.isDuplicate));
    toast.success('Duplicate entries removed');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !isImporting) { handleReset(); onClose(); } }}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 pb-3 sm:pb-4 border-b border-border/50 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 text-base sm:text-lg">
              <div className="p-2 bg-primary/10 rounded-xl">
                <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              Bulk Import Students
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm mt-1">
              CSV/Excel file upload ya data paste karke multiple students add karo
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-5">
          {isImporting ? (
            <div className="flex flex-col items-center justify-center gap-5 py-10">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-white text-[10px] font-bold shadow-lg">
                  {importProgress.current}
                </div>
              </div>
              <div className="w-full max-w-sm space-y-3">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-foreground">Importing students...</span>
                  <span className="text-primary">{importProgress.current}/{importProgress.total}</span>
                </div>
                <div className="relative">
                  <Progress value={progressPercent} className="h-3 rounded-full" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-primary-foreground drop-shadow-sm">
                      {progressPercent}%
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground text-center">
                  Please don't close this dialog
                </p>
              </div>
            </div>
          ) : parsedStudents.length === 0 ? (
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="grid w-full grid-cols-2 h-11 rounded-xl bg-muted/60 p-1">
                <TabsTrigger value="upload" className="gap-2 rounded-lg text-xs sm:text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> File Upload
                </TabsTrigger>
                <TabsTrigger value="paste" className="gap-2 rounded-lg text-xs sm:text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <ClipboardPaste className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Copy-Paste
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-3 mt-4">
                <div
                  className="relative group border-2 border-dashed border-primary/25 rounded-2xl p-6 sm:p-8 text-center hover:border-primary/50 transition-all duration-300 cursor-pointer bg-gradient-to-b from-primary/[0.03] to-transparent"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-semibold text-foreground text-sm sm:text-base">Click to upload file</p>
                  <p className="text-xs text-muted-foreground mt-1">Supports .csv, .txt, .xlsx, .xls</p>
                  {fileName && (
                    <Badge variant="secondary" className="mt-3 gap-1">
                      <FileSpreadsheet className="w-3 h-3" />
                      {fileName}
                    </Badge>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept=".csv,.txt,.xlsx,.xls" className="hidden" onChange={handleFileUpload} />
                <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="w-full gap-2 h-10 rounded-xl">
                  <Download className="w-4 h-4" />
                  Download CSV Template
                </Button>
              </TabsContent>

              <TabsContent value="paste" className="space-y-3 mt-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Paste tab-separated or comma-separated data. First row = headers:
                  </p>
                  <div className="bg-muted/50 rounded-xl p-2.5 text-[11px] font-mono overflow-x-auto border border-border/30">
                    Full Name, Course, Batch, Mobile, Enrollment Date, Fees Status
                  </div>
                </div>
                <Textarea
                  placeholder={`Full Name,Course,Batch,Mobile,Enrollment Date,Fees Status\nRahul Kumar,Diploma in Computer Application,Morning,9876543210,2025-01-15,not_paid`}
                  value={pasteText}
                  onChange={e => setPasteText(e.target.value)}
                  rows={7}
                  className="font-mono text-xs sm:text-sm rounded-xl"
                />
                <Button onClick={handleParsePaste} className="w-full gap-2 h-10 rounded-xl">
                  <CheckCircle2 className="w-4 h-4" />
                  Parse Data
                </Button>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex flex-col gap-3 min-h-0">
              {/* Summary badges */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg px-2.5 py-1 text-xs">
                  <CheckCircle2 className="w-3 h-3" />
                  {validCount} Valid
                </Badge>
                {invalidCount > 0 && (
                  <Badge variant="destructive" className="gap-1.5 rounded-lg px-2.5 py-1 text-xs">
                    <XCircle className="w-3 h-3" />
                    {invalidCount} Invalid
                  </Badge>
                )}
                {duplicateCount > 0 && (
                  <Badge className="gap-1.5 bg-amber-500/90 hover:bg-amber-600 text-white rounded-lg px-2.5 py-1 text-xs border-0">
                    <Copy className="w-3 h-3" />
                    {duplicateCount} Duplicate{duplicateCount > 1 ? 's' : ''}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Total: {parsedStudents.length}
                </span>
              </div>

              {/* Duplicate warning banner */}
              {duplicateCount > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                      {duplicateCount} student{duplicateCount > 1 ? 's' : ''} already exist with same name & course
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      You can still import them or remove duplicates
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={removeDuplicates} className="flex-shrink-0 text-[11px] h-7 px-2.5 rounded-lg border-amber-500/30 text-amber-600 hover:bg-amber-500/10">
                    Remove
                  </Button>
                </div>
              )}

              <ScrollArea className="flex-1 max-h-[35vh] border rounded-xl overflow-hidden">
                <div className="divide-y divide-border/50">
                  {parsedStudents.map((student, idx) => (
                    <div
                      key={idx}
                      className={`p-3 flex items-start gap-3 transition-colors ${
                        !student.isValid ? 'bg-destructive/[0.04]' : student.isDuplicate ? 'bg-amber-500/[0.04]' : 'bg-background hover:bg-muted/30'
                      }`}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {!student.isValid ? (
                          <div className="w-6 h-6 rounded-lg bg-destructive/10 flex items-center justify-center">
                            <XCircle className="w-3.5 h-3.5 text-destructive" />
                          </div>
                        ) : student.isDuplicate ? (
                          <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center">
                            <Copy className="w-3.5 h-3.5 text-amber-500" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {student.fullName || '(No Name)'}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {student.course} {student.batch && `• ${student.batch}`} {student.mobile && `• ${student.mobile}`}
                        </p>
                        {student.errors.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {student.errors.map((err, i) => (
                              <Badge key={i} variant="destructive" className="text-[10px] px-1.5 py-0 h-4 rounded-md">
                                {err}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {student.warnings.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {student.warnings.map((warn, i) => (
                              <Badge key={i} className="text-[10px] px-1.5 py-0 h-4 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20">
                                ⚠ {warn}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive rounded-lg flex-shrink-0"
                        onClick={() => removeStudent(idx)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex gap-2 pt-1">
                <Button variant="outline" onClick={handleReset} className="flex-1 h-10 rounded-xl">
                  Back
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={validCount === 0}
                  className="flex-1 gap-2 h-10 rounded-xl"
                >
                  <Upload className="w-4 h-4" />
                  Import {validCount} Students
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
