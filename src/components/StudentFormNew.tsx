import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Student, MonthlyPayment } from '@/types/student';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UserPlus, RotateCcw, Save, Pencil, GraduationCap, Clock, CalendarDays, Loader2 } from 'lucide-react';
import { COURSES, COURSE_CATEGORIES, getCourseByName } from '@/data/courses';
import { generateMonthlyPayments } from '@/hooks/useStudentsQuery';
import { format } from 'date-fns';
import { studentFormSchema, StudentFormValues } from '@/lib/validations/student';

interface StudentFormProps {
  editingStudent: Student | null;
  onSubmit: (data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'> & { monthlyPayments: MonthlyPayment[] }) => void;
  onUpdate: (id: string, data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function StudentFormNew({ editingStudent, onSubmit, onUpdate, onCancel, isSubmitting = false }: StudentFormProps) {
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      fullName: '',
      course: '',
      batch: '',
      feesAmount: 0,
      monthlyFee: 0,
      courseDuration: 1,
      enrollmentDate: format(new Date(), 'yyyy-MM-dd'),
      feesStatus: 'not_paid',
      mobile: '',
      address: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (editingStudent) {
      form.reset({
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
      });
    }
  }, [editingStudent, form]);

  const handleFormSubmit = (values: StudentFormValues) => {
    const monthlyPayments = !editingStudent && values.courseDuration > 0
      ? generateMonthlyPayments(values.enrollmentDate, values.courseDuration, values.feesAmount)
      : [];

    const submitData = {
      fullName: values.fullName,
      course: values.course,
      batch: values.batch || '',
      feesAmount: values.feesAmount,
      monthlyFee: values.monthlyFee,
      courseDuration: values.courseDuration,
      enrollmentDate: values.enrollmentDate,
      feesStatus: values.feesStatus,
      mobile: values.mobile || '',
      address: values.address || '',
      notes: values.notes || '',
      monthlyPayments,
    };

    if (editingStudent) {
      onUpdate(editingStudent.id, submitData);
    } else {
      onSubmit(submitData);
    }
    
    handleClear();
  };

  const handleClear = () => {
    form.reset({
      fullName: '',
      course: '',
      batch: '',
      feesAmount: 0,
      monthlyFee: 0,
      courseDuration: 1,
      enrollmentDate: format(new Date(), 'yyyy-MM-dd'),
      feesStatus: 'not_paid',
      mobile: '',
      address: '',
      notes: '',
    });
    onCancel();
  };

  const handleCourseChange = (value: string) => {
    const course = getCourseByName(value);
    if (course) {
      form.setValue('course', value);
      form.setValue('feesAmount', course.totalFee);
      form.setValue('monthlyFee', course.monthlyFee);
      form.setValue('courseDuration', course.durationMonths);
    } else {
      form.setValue('course', value);
    }
  };

  const selectedCourse = getCourseByName(form.watch('course'));

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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Full Name */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Full Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter student's full name"
                      className="input-focus"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Course */}
            <FormField
              control={form.control}
              name="course"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-primary" />
                    Course <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select value={field.value} onValueChange={handleCourseChange}>
                    <FormControl>
                      <SelectTrigger className="input-focus">
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                    </FormControl>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Enrollment Date */}
            <FormField
              control={form.control}
              name="enrollmentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-primary" />
                    Enrollment Date <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      className="input-focus"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Batch */}
            <FormField
              control={form.control}
              name="batch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Batch / Year</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., 2025 Batch"
                      className="input-focus"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter mobile number"
                      className="input-focus"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Address */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter address (optional)"
                      rows={3}
                      className="input-focus resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Any additional notes (optional)"
                      rows={3}
                      className="input-focus resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-3">
            <Button 
              type="submit" 
              className="btn-glow px-6 font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {editingStudent ? 'Update Student' : 'Save Student'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClear}
              className="px-6 font-medium"
              disabled={isSubmitting}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
