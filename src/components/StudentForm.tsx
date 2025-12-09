import { useState, useEffect } from 'react';
import { Student } from '@/types/student';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { UserPlus, RotateCcw, Save, Pencil, GraduationCap, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { COURSES, COURSE_CATEGORIES, getCourseByName } from '@/data/courses';

interface StudentFormProps {
  editingStudent: Student | null;
  onSubmit: (data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (id: string, data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

type FormData = {
  fullName: string;
  course: string;
  batch: string;
  feesAmount: number;
  feesStatus: 'paid' | 'not_paid';
  mobile: string;
  address: string;
  notes: string;
};

const initialFormState: FormData = {
  fullName: '',
  course: '',
  batch: '',
  feesAmount: 0,
  feesStatus: 'not_paid',
  mobile: '',
  address: '',
  notes: '',
};

export function StudentForm({ editingStudent, onSubmit, onUpdate, onCancel }: StudentFormProps) {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingStudent) {
      setFormData({
        fullName: editingStudent.fullName,
        course: editingStudent.course,
        batch: editingStudent.batch,
        feesAmount: editingStudent.feesAmount,
        feesStatus: editingStudent.feesStatus,
        mobile: editingStudent.mobile,
        address: editingStudent.address,
        notes: editingStudent.notes,
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    if (editingStudent) {
      onUpdate(editingStudent.id, formData);
      toast.success('Student updated successfully');
    } else {
      onSubmit(formData);
      toast.success('Student added successfully');
    }
    
    handleClear();
  };

  const handleClear = () => {
    setFormData(initialFormState);
    setErrors({});
    onCancel();
  };

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
              className={`input-focus ${errors.fullName ? 'border-destructive focus:ring-destructive/20' : ''}`}
            />
            {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
          </div>

          {/* Course */}
          <div className="space-y-2">
            <Label htmlFor="course" className="text-sm font-medium flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-primary" />
              Course <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.course}
              onValueChange={(value) => {
                const course = getCourseByName(value);
                setFormData({ 
                  ...formData, 
                  course: value,
                  feesAmount: course ? course.totalFee : formData.feesAmount
                });
              }}
            >
              <SelectTrigger className={`input-focus ${errors.course ? 'border-destructive' : ''}`}>
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

          {/* Batch */}
          <div className="space-y-2">
            <Label htmlFor="batch" className="text-sm font-medium">Batch / Year</Label>
            <Input
              id="batch"
              value={formData.batch}
              onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
              placeholder="e.g., 2025 Batch"
              className="input-focus"
            />
          </div>

          {/* Fees Amount */}
          <div className="space-y-2">
            <Label htmlFor="feesAmount" className="text-sm font-medium">Fees Amount (₹)</Label>
            <Input
              id="feesAmount"
              type="number"
              min="0"
              value={formData.feesAmount}
              onChange={(e) => setFormData({ ...formData, feesAmount: Number(e.target.value) })}
              placeholder="Enter fees amount"
              className={`input-focus ${errors.feesAmount ? 'border-destructive' : ''}`}
            />
            {errors.feesAmount && <p className="text-xs text-destructive">{errors.feesAmount}</p>}
          </div>

          {/* Fees Status */}
          <div className="space-y-2">
            <Label htmlFor="feesStatus" className="text-sm font-medium">Fees Status</Label>
            <Select
              value={formData.feesStatus}
              onValueChange={(value: 'paid' | 'not_paid') => setFormData({ ...formData, feesStatus: value })}
            >
              <SelectTrigger className="input-focus">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="not_paid">Not Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mobile */}
          <div className="space-y-2">
            <Label htmlFor="mobile" className="text-sm font-medium">Mobile Number</Label>
            <Input
              id="mobile"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              placeholder="Enter mobile number"
              className="input-focus"
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
              className="input-focus resize-none"
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
              className="input-focus resize-none"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-3">
          <Button 
            type="submit" 
            className="btn-glow px-6 font-medium"
          >
            <Save className="w-4 h-4 mr-2" />
            {editingStudent ? 'Update Student' : 'Save Student'}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClear}
            className="px-6 font-medium"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
      </form>
    </div>
  );
}
