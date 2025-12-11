import { useState } from 'react';
import { Student } from '@/types/student';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileJson, Printer, ChevronDown } from 'lucide-react';
import { exportToCSV, exportToJSON, generatePrintableReport } from '@/utils/exportData';
import { toast } from 'sonner';

interface ExportButtonProps {
  students: Student[];
}

export function ExportButton({ students }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (type: 'csv' | 'json' | 'print') => {
    if (students.length === 0) {
      toast.error('No students to export');
      return;
    }

    setIsExporting(true);
    try {
      switch (type) {
        case 'csv':
          exportToCSV(students);
          toast.success('Exported to CSV successfully');
          break;
        case 'json':
          exportToJSON(students);
          toast.success('Exported to JSON successfully');
          break;
        case 'print':
          generatePrintableReport(students);
          toast.success('Print report generated');
          break;
      }
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 font-medium"
          disabled={isExporting || students.length === 0}
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => handleExport('csv')} className="gap-2 cursor-pointer">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')} className="gap-2 cursor-pointer">
          <FileJson className="w-4 h-4 text-blue-600" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport('print')} className="gap-2 cursor-pointer">
          <Printer className="w-4 h-4 text-violet-600" />
          Print Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
