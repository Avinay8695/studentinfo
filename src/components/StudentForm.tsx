import { useState, useEffect } from 'react';
import { Student } from '@/types/student';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, RotateCcw, Save } from 'lucide-react';
import { toast } from 'sonner';

interface StudentFormProps {
  editingStudent: Student | null;
  onSubmit: (data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (id: string, data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const COURSES = ['Basic Computer', 'Tally', 'Programming', 'MS Office', 'Web Development', 'Data Entry'];

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
    <div className="bg-card rounded-lg shadow-card p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <UserPlus className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-card-foreground">
          {editingStudent ? 'Edit Student' : 'Add New Student'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Enter student's full name"
              className={errors.fullName ? 'border-destructive' : ''}
            />
            {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
          </div>

          {/* Course */}
          <div className="space-y-2">
            <Label htmlFor="course">Course *</Label>
            <Select
              value={formData.course}
              onValueChange={(value) => setFormData({ ...formData, course: value })}
            >
              <SelectTrigger className={errors.course ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {COURSES.map((course) => (
                  <SelectItem key={course} value={course}>
                    {course}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.course && <p className="text-sm text-destructive">{errors.course}</p>}
          </div>

          {/* Batch */}
          <div className="space-y-2">
            <Label htmlFor="batch">Batch / Year</Label>
            <Input
              id="batch"
              value={formData.batch}
              onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
              placeholder="e.g., 2025 Batch"
            />
          </div>

          {/* Fees Amount */}
          <div className="space-y-2">
            <Label htmlFor="feesAmount">Fees Amount (₹)</Label>
            <Input
              id="feesAmount"
              type="number"
              min="0"
              value={formData.feesAmount}
              onChange={(e) => setFormData({ ...formData, feesAmount: Number(e.target.value) })}
              placeholder="Enter fees amount"
              className={errors.feesAmount ? 'border-destructive' : ''}
            />
            {errors.feesAmount && <p className="text-sm text-destructive">{errors.feesAmount}</p>}
          </div>

          {/* Fees Status */}
          <div className="space-y-2">
            <Label htmlFor="feesStatus">Fees Status</Label>
            <Select
              value={formData.feesStatus}
              onValueChange={(value: 'paid' | 'not_paid') => setFormData({ ...formData, feesStatus: value })}
            >
              <SelectTrigger>
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
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input
              id="mobile"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              placeholder="Enter mobile number"
            />
          </div>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Enter address (optional)"
            rows={2}
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any additional notes (optional)"
            rows={2}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <Button type="submit" className="flex-1 md:flex-none">
            <Save className="w-4 h-4 mr-2" />
            {editingStudent ? 'Update Student' : 'Save Student'}
          </Button>
          <Button type="button" variant="outline" onClick={handleClear}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
      </form>
    </div>
  );
}
