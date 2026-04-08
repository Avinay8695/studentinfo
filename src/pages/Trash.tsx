import { useState } from 'react';
import { useTrashedStudents } from '@/hooks/useStudentsQuery';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash2, RotateCcw, AlertTriangle, Inbox, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { EmptyState } from '@/components/EmptyState';

const Trash = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const {
    trashedStudents,
    isLoading,
    restoreStudent,
    permanentDeleteStudent,
    isRestoring,
    isDeleting,
  } = useTrashedStudents();

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteName, setConfirmDeleteName] = useState('');

  const handlePermanentDelete = async () => {
    if (confirmDeleteId) {
      await permanentDeleteStudent(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  const studentToDelete = confirmDeleteId;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="rounded-xl"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-destructive/10 rounded-xl">
                    <Trash2 className="w-5 h-5 text-destructive" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold font-display">Trash</h1>
                </div>
                <p className="text-sm text-muted-foreground mt-1 ml-[52px]">
                  {trashedStudents.length} deleted student{trashedStudents.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && trashedStudents.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="p-0">
                <EmptyState
                  icon={<Inbox className="w-10 h-10" />}
                  title="Trash is empty"
                  description="Deleted students will appear here. You can restore them or permanently remove them."
                  variant="trash"
                  action={
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => navigate('/')}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Dashboard
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          )}

          {/* Desktop Table */}
          {!isLoading && trashedStudents.length > 0 && !isMobile && (
            <Card className="rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Fees</TableHead>
                    <TableHead>Deleted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trashedStudents.map(student => (
                    <TableRow key={student.id} className="group hover:bg-destructive/5 transition-colors">
                      <TableCell className="font-medium">{student.fullName}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">{student.course}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">₹{student.feesAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(student.deletedAt), { addSuffix: true })}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isAdmin && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-lg text-xs gap-1.5 hover:bg-green-50 hover:text-green-700 hover:border-green-200 dark:hover:bg-green-950 dark:hover:text-green-400"
                                onClick={() => restoreStudent(student.id)}
                                disabled={isRestoring}
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Restore
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-lg text-xs gap-1.5 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                                onClick={() => {
                                  setConfirmDeleteId(student.id);
                                  setConfirmDeleteName(student.fullName);
                                }}
                                disabled={isDeleting}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete Forever
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

          {/* Mobile Cards */}
          {!isLoading && trashedStudents.length > 0 && isMobile && (
            <div className="space-y-3">
              {trashedStudents.map(student => (
                <Card key={student.id} className="rounded-xl border-destructive/20 bg-destructive/[0.02] dark:bg-destructive/[0.05]">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm truncate">{student.fullName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-[10px] h-5">{student.course}</Badge>
                          <span className="text-xs text-muted-foreground">
                            ₹{student.feesAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                        {formatDistanceToNow(new Date(student.deletedAt), { addSuffix: true })}
                      </span>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 rounded-lg text-xs gap-1.5 h-9 hover:bg-green-50 hover:text-green-700 hover:border-green-200 dark:hover:bg-green-950 dark:hover:text-green-400"
                          onClick={() => restoreStudent(student.id)}
                          disabled={isRestoring}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Restore
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 rounded-lg text-xs gap-1.5 h-9 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                          onClick={() => {
                            setConfirmDeleteId(student.id);
                            setConfirmDeleteName(student.fullName);
                          }}
                          disabled={isDeleting}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete Forever
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Permanent Delete Confirmation */}
      <AlertDialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <AlertDialogContent className="max-w-md rounded-xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-destructive/10 rounded-full">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <AlertDialogTitle className="text-xl font-display">Permanently Delete</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base">
              Are you sure you want to permanently delete <span className="font-semibold text-foreground">"{confirmDeleteName}"</span>?
              This action cannot be undone and all data will be lost forever.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="mt-0 rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePermanentDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Trash;
