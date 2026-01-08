import { useState, useEffect } from 'react';
import { Student, MonthlyPayment } from '@/types/student';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { UserPlus, RotateCcw, Save, Pencil, GraduationCap, Clock, CalendarDays, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { COURSES, COURSE_CATEGORIES, getCourseByName } from '@/data/courses';
import { generateMonthlyPayments } from '@/hooks/useStudents';
import { format } from 'date-fns';

interface StudentFormProps {
  editingStudent: Student | null;
  onSubmit: (data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (id: string, data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isAdmin?: boolean;
}

type FormData = {
  fullName: string;
  course: string;
  batch: string;
  feesAmount: number;
  monthlyFee: number;
  courseDuration: number;
  enrollmentDate: string;
  feesStatus: 'paid' | 'not_paid';
  mobile: string;
  address: string;
  notes: string;
  monthlyPayments: MonthlyPayment[];
};

const initialFormState: FormData = {
  fullName: '',
  course: '',
  batch: '',
  feesAmount: 0,
  monthlyFee: 0,
  courseDuration: 0,
  enrollmentDate: format(new Date(), 'yyyy-MM-dd'),
  feesStatus: 'not_paid',
  mobile: '',
  address: '',
  notes: '',
  monthlyPayments: [],
};

export function StudentForm({ editingStudent, onSubmit, onUpdate, onCancel, isAdmin = false }: StudentFormProps) {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!editingStudent;
  const isReadOnly = isEditing && !isAdmin;

  useEffect(() => {
    if (editingStudent) {
      setFormData({
        fullName: editingStudent.fullName,
        course: editingStudent.course,
        batch: editingStudent.batch,
        feesAmount: editingStudent.feesAmount,
        monthlyFee: editingStudent.monthlyFee,
        courseDuration: editingStudent.courseDuration,
        enrollmentDate: editingStudent.enrollmentDate ? format(new Date(editingStudent.enrollmentDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        feesStatus: editingStudent.feesStatus,
        mobile: editingStudent.mobile,
        address: editingStudent.address,
        notes: editingStudent.notes,
        monthlyPayments: editingStudent.monthlyPayments || [],
      });
    }
  }, [editingStudent]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!formData.course) {
      newErrors.course = 'Course is required';
    }
    if (formData.feesAmount < 0) {
      newErrors.feesAmount = 'Fees cannot be negative';
    }
    if (!formData.enrollmentDate) {
      newErrors.enrollmentDate = 'Enrollment date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    // Generate monthly payments for new students using total fee
    let submitData = { ...formData };
    if (!editingStudent && formData.courseDuration > 0) {
      submitData.monthlyPayments = generateMonthlyPayments(
        formData.enrollmentDate,
        formData.courseDuration,
        formData.feesAmount // Use total fee instead of monthly fee
      );
    }

    if (editingStudent) {
      onUpdate(editingStudent.id, submitData);
      toast.success('Student updated successfully');
    } else {
      onSubmit(submitData);
      toast.success('Student added successfully');
    }
    
    handleClear();
  };

  const handleClear = () => {
    setFormData(initialFormState);
    setErrors({});
    onCancel();
  };

  const handleCourseChange = (value: string) => {
    const course = getCourseByName(value);
    if (course) {
      setFormData({ 
        ...formData, 
        course: value,
        feesAmount: course.totalFee,
        monthlyFee: course.monthlyFee,
        courseDuration: course.durationMonths,
      });
    } else {
      setFormData({ ...formData, course: value });
    }
  };

  const selectedCourse = getCourseByName(formData.course);

  return (
    <div className="card-elevated p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2.5 rounded-xl ${editingStudent ? 'bg-accent/10' : 'bg-primary/10'}`}>
          {editingStudent ? (
            <Pencil className="w-5 h-5 text-accent" />
          ) : (
            <UserPlus className="w-5 h-5 text-primary" />
          )}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-card-foreground font-display">
            {editingStudent ? 'Edit Student' : 'Add New Student'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {editingStudent ? 'Update student information' : 'Fill in the details below'}
          </p>
        </div>
      </div>

      {/* Read-Only Notice for Regular Users */}
      {isReadOnly && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-600" />
          <p className="text-sm text-amber-700">Only admins can edit student information. Viewing in read-only mode.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Enter student's full name"
              disabled={isReadOnly}
              className={`input-focus ${errors.fullName ? 'border-destructive focus:ring-destructive/20' : ''} ${isReadOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
            {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
          </div>

          {/* Course */}
          <div className="space-y-2">
            <Label htmlFor="course" className="text-sm font-medium flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-primary" />
              Course <span className="text-destructive">*</span>
            </Label>
            <Select value={formData.course} onValueChange={handleCourseChange} disabled={isReadOnly}>
              <SelectTrigger className={`input-focus ${errors.course ? 'border-destructive' : ''} ${isReadOnly ? 'opacity-60 cursor-not-allowed' : ''}`}>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {COURSE_CATEGORIES.map((category) => (
                  <SelectGroup key={category}>
                    <SelectLabel className="text-xs font-semibold text-primary px-2 py-1.5 bg-primary/5">{category}</SelectLabel>
                    {COURSES.filter(c => c.category === category).map((course) => (
                      <SelectItem key={course.name} value={course.name} className="pl-4">
                        <div className="flex items-center justify-between w-full gap-4">
                          <span>{course.name}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {course.duration}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
            {errors.course && <p className="text-xs text-destructive">{errors.course}</p>}
          </div>

          {/* Enrollment Date */}
          <div className="space-y-2">
            <Label htmlFor="enrollmentDate" className="text-sm font-medium flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              Enrollment Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="enrollmentDate"
              type="date"
              value={formData.enrollmentDate}
              onChange={(e) => setFormData({ ...formData, enrollmentDate: e.target.value })}
              disabled={isReadOnly}
              className={`input-focus ${errors.enrollmentDate ? 'border-destructive' : ''} ${isReadOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
            {errors.enrollmentDate && <p className="text-xs text-destructive">{errors.enrollmentDate}</p>}
          </div>

          {/* Batch */}
          <div className="space-y-2">
            <Label htmlFor="batch" className="text-sm font-medium">Batch / Year</Label>
            <Input
              id="batch"
              value={formData.batch}
              onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
              placeholder="e.g., 2025 Batch"
              disabled={isReadOnly}
              className={`input-focus ${isReadOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
          </div>

          {/* Course Info - Read Only */}
          {selectedCourse && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Course Details</Label>
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{selectedCourse.durationMonths} months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Fee:</span>
                  <span className="font-medium">₹{selectedCourse.monthlyFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Fee:</span>
                  <span className="font-semibold text-primary">₹{selectedCourse.totalFee}</span>
                </div>
              </div>
            </div>
          )}

          {/* Mobile */}
          <div className="space-y-2">
            <Label htmlFor="mobile" className="text-sm font-medium">Mobile Number</Label>
            <Input
              id="mobile"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              placeholder="Enter mobile number"
              disabled={isReadOnly}
              className={`input-focus ${isReadOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter address (optional)"
              rows={3}
              disabled={isReadOnly}
              className={`input-focus resize-none ${isReadOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes (optional)"
              rows={3}
              disabled={isReadOnly}
              className={`input-focus resize-none ${isReadOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
          </div>
        </div>

        {/* Buttons - Hide save button for read-only mode */}
        <div className="flex gap-3 pt-3">
          {!isReadOnly && (
            <Button 
              type="submit" 
              className="btn-glow px-6 font-medium"
            >
              <Save className="w-4 h-4 mr-2" />
              {editingStudent ? 'Update Student' : 'Save Student'}
            </Button>
          )}
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClear}
            className="px-6 font-medium"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {isReadOnly ? 'Close' : 'Clear'}
          </Button>
        </div>
      </form>
    </div>
  );
}
