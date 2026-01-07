import { supabase } from "@/integrations/supabase/client";

type ActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN';
type EntityType = 'STUDENT' | 'PAYMENT' | 'USER';

interface LogActivityParams {
  action: ActionType;
  entityType: EntityType;
  entityId?: string;
  details?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    description?: string;
    [key: string]: unknown;
  };
}

export async function logActivity({
  action,
  entityType,
  entityId,
  details = {},
}: LogActivityParams): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.warn('Cannot log activity: No authenticated user');
      return { success: false, error: 'No authenticated user' };
    }

    // Get user profile for name
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('user_id', user.id)
      .single();

    const performedByName = profile?.full_name || user.email || 'Unknown User';
    const performedById = profile?.id;

    // Insert audit log using raw query since types might not be updated yet
    const { error: insertError } = await supabase
      .from('audit_logs' as any)
      .insert({
        action_type: action,
        entity_type: entityType,
        entity_id: entityId || null,
        performed_by: performedById,
        performed_by_name: performedByName,
        details: details,
      } as any);

    if (insertError) {
      console.error('Failed to insert audit log:', insertError);
      return { success: false, error: insertError.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error logging activity:', err);
    return { success: false, error: 'Unexpected error' };
  }
}

// Helper functions for common actions
export const logStudentCreate = (studentId: string, studentData: Record<string, unknown>) =>
  logActivity({
    action: 'CREATE',
    entityType: 'STUDENT',
    entityId: studentId,
    details: { after: studentData, description: `Created new student: ${studentData.full_name}` },
  });

export const logStudentUpdate = (
  studentId: string,
  before: Record<string, unknown>,
  after: Record<string, unknown>
) =>
  logActivity({
    action: 'UPDATE',
    entityType: 'STUDENT',
    entityId: studentId,
    details: { before, after, description: `Updated student: ${after.full_name || before.full_name}` },
  });

export const logStudentDelete = (studentId: string, studentData: Record<string, unknown>) =>
  logActivity({
    action: 'DELETE',
    entityType: 'STUDENT',
    entityId: studentId,
    details: { before: studentData, description: `Deleted student: ${studentData.full_name}` },
  });

export const logPaymentUpdate = (
  paymentId: string,
  studentName: string,
  before: Record<string, unknown>,
  after: Record<string, unknown>
) =>
  logActivity({
    action: 'UPDATE',
    entityType: 'PAYMENT',
    entityId: paymentId,
    details: { before, after, description: `Updated payment for: ${studentName}` },
  });

export const logUserLogin = () =>
  logActivity({
    action: 'LOGIN',
    entityType: 'USER',
    details: { description: 'User logged in' },
  });
