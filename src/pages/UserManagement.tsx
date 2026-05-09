import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Shield, User, Users, Loader2, CheckCircle, Clock, UserCheck, Ban, Trash2, ShieldOff } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { logUserBan, logUserDelete } from '@/utils/logger';
import { UserManagementSkeleton } from '@/components/skeletons/UserManagementSkeleton';

interface UserWithRole {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  role: 'admin' | 'user';
  is_approved: boolean;
  is_banned: boolean;
  created_at: string;
}

// Mobile User Card Component
function UserCard({ 
  userItem, 
  type, 
  onApprove, 
  onBan, 
  onDelete, 
  onRoleChange, 
  updatingUserId, 
  currentUserId 
}: { 
  userItem: UserWithRole; 
  type: 'pending' | 'approved' | 'banned';
  onApprove?: (userId: string) => void;
  onBan?: (userItem: UserWithRole) => void;
  onDelete?: (userItem: UserWithRole) => void;
  onRoleChange?: (userId: string, role: 'admin' | 'user') => void;
  updatingUserId: string | null;
  currentUserId?: string;
}) {
  const isUpdating = updatingUserId === userItem.user_id;
  const isSelf = userItem.user_id === currentUserId;

  return (
    <div className={`p-4 rounded-xl border-2 transition-all ${
      type === 'pending' ? 'border-amber-500/20 bg-amber-500/5' :
      type === 'banned' ? 'border-destructive/20 bg-destructive/5' :
      'border-border bg-card'
    }`}>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={`p-2.5 rounded-full flex-shrink-0 ${
          type === 'pending' ? 'bg-amber-500/15' :
          type === 'banned' ? 'bg-destructive/15' :
          userItem.role === 'admin' ? 'bg-primary/15' : 'bg-muted'
        }`}>
          {type === 'pending' ? <Clock className="w-5 h-5 text-amber-500" /> :
           type === 'banned' ? <Ban className="w-5 h-5 text-destructive" /> :
           userItem.role === 'admin' ? <Shield className="w-5 h-5 text-primary" /> :
           <User className="w-5 h-5 text-muted-foreground" />}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-semibold text-sm text-card-foreground truncate">
              {userItem.full_name || 'Unnamed User'}
            </p>
            {type === 'approved' && (
              <Badge 
                variant={userItem.role === 'admin' ? 'default' : 'secondary'}
                className={`text-[10px] px-1.5 py-0 h-4 ${userItem.role === 'admin' ? 'bg-primary' : ''}`}
              >
                {userItem.role === 'admin' ? 'Admin' : 'User'}
              </Badge>
            )}
            {isSelf && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">You</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{userItem.email}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
        {type === 'pending' && onApprove && (
          <Button
            size="sm"
            onClick={() => onApprove(userItem.user_id)}
            disabled={isUpdating}
            className="flex-1 bg-green-600 hover:bg-green-700 min-h-[40px]"
          >
            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <><UserCheck className="w-4 h-4 mr-1.5" /> Approve</>
            )}
          </Button>
        )}

        {type === 'approved' && onRoleChange && !isSelf && (
          <Select
            value={userItem.role}
            onValueChange={(value: 'admin' | 'user') => onRoleChange(userItem.user_id, value)}
            disabled={isUpdating}
          >
            <SelectTrigger className="flex-1 min-h-[40px]">
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <SelectValue />}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">
                <span className="flex items-center gap-2"><Shield className="w-3 h-3" /> Admin</span>
              </SelectItem>
              <SelectItem value="user">
                <span className="flex items-center gap-2"><User className="w-3 h-3" /> User</span>
              </SelectItem>
            </SelectContent>
          </Select>
        )}

        {type === 'approved' && onBan && !isSelf && userItem.role !== 'admin' && (
          <Button
            size="icon"
            variant="outline"
            onClick={() => onBan(userItem)}
            disabled={isUpdating}
            className="min-h-[40px] min-w-[40px] text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-500/10"
          >
            <Ban className="w-4 h-4" />
          </Button>
        )}

        {type === 'banned' && onBan && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onBan(userItem)}
            disabled={isUpdating}
            className="flex-1 min-h-[40px] text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-500/10"
          >
            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <><ShieldOff className="w-4 h-4 mr-1.5" /> Unban</>
            )}
          </Button>
        )}

        {onDelete && !isSelf && (
          <Button
            size="icon"
            variant="outline"
            onClick={() => onDelete(userItem)}
            disabled={isUpdating}
            className="min-h-[40px] min-w-[40px] text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default function UserManagement() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, loading: authLoading, user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserWithRole | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/auth', { replace: true });
      } else if (!isAdmin) {
        toast.error('Access denied. Admin only.');
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, email, full_name, is_approved, is_banned, created_at');
      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      if (rolesError) throw rolesError;

      const usersWithRoles: UserWithRole[] = (profiles || []).map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.user_id);
        return {
          ...profile,
          role: (userRole?.role as 'admin' | 'user') || 'user',
          is_approved: profile.is_approved ?? false,
          is_banned: profile.is_banned ?? false,
        };
      });
      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      setUpdatingUserId(userId);
      const { error } = await supabase.from('user_roles').update({ role: newRole }).eq('user_id', userId);
      if (error) throw error;
      setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, role: newRole } : u));
      toast.success(`Role updated to ${newRole}`);
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      setUpdatingUserId(userId);
      const { error } = await supabase.from('profiles').update({ is_approved: true }).eq('user_id', userId);
      if (error) throw error;
      setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, is_approved: true } : u));
      toast.success('User approved successfully!');
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('Failed to approve user');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleBanUser = async (userItem: UserWithRole) => {
    try {
      setUpdatingUserId(userItem.user_id);
      const newBannedStatus = !userItem.is_banned;
      const { error } = await supabase.from('profiles').update({ is_banned: newBannedStatus }).eq('user_id', userItem.user_id);
      if (error) throw error;
      setUsers(prev => prev.map(u => u.user_id === userItem.user_id ? { ...u, is_banned: newBannedStatus } : u));
      await logUserBan(userItem.user_id, userItem.email || 'Unknown', newBannedStatus);
      toast.success(newBannedStatus ? 'User banned successfully!' : 'User unbanned successfully!');
    } catch (error) {
      console.error('Error banning/unbanning user:', error);
      toast.error('Failed to update ban status');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      setDeleting(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error('Authentication required'); return; }

      const response = await fetch(
        `https://uqitybcfiwfxeitpeqfb.supabase.co/functions/v1/delete-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ user_id: userToDelete.user_id }),
        }
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to delete user');

      await logUserDelete(userToDelete.user_id, userToDelete.email || 'Unknown');
      setUsers(prev => prev.filter(u => u.user_id !== userToDelete.user_id));
      toast.success('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete user');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const openDeleteDialog = (userItem: UserWithRole) => {
    setUserToDelete(userItem);
    setDeleteDialogOpen(true);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 w-full mx-auto px-3 sm:px-4 lg:px-8 xl:px-12 2xl:px-16 py-4 sm:py-8">
          <UserManagementSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  const adminCount = users.filter(u => u.role === 'admin').length;
  const userCount = users.filter(u => u.role === 'user').length;
  const pendingUsers = users.filter(u => !u.is_approved && u.role !== 'admin' && !u.is_banned);
  const approvedUsers = users.filter(u => (u.is_approved || u.role === 'admin') && !u.is_banned);
  const bannedUsers = users.filter(u => u.is_banned);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-3 -ml-2 min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 sm:p-3 bg-primary/10 rounded-xl">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold">User Management</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Manage user roles and permissions</p>
            </div>
          </div>
        </div>

        {/* Stats Cards - Scrollable on mobile */}
        <div className="flex gap-3 mb-4 sm:mb-6 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-5 sm:overflow-visible">
          {[
            { label: 'Pending', value: pendingUsers.length, icon: Clock, color: 'amber' },
            { label: 'Approved', value: approvedUsers.length, icon: CheckCircle, color: 'green' },
            { label: 'Banned', value: bannedUsers.length, icon: Ban, color: 'red' },
            { label: 'Admins', value: adminCount, icon: Shield, color: 'primary' },
            { label: 'Users', value: userCount, icon: User, color: 'muted' },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className={`min-w-[120px] sm:min-w-0 flex-shrink-0 sm:flex-shrink border-${color === 'primary' ? 'primary' : color === 'red' ? 'destructive' : color === 'muted' ? 'border' : color + '-500'}/20`}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${
                    color === 'amber' ? 'bg-amber-500/10' :
                    color === 'green' ? 'bg-green-500/10' :
                    color === 'red' ? 'bg-destructive/10' :
                    color === 'primary' ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    <Icon className={`w-4 h-4 ${
                      color === 'amber' ? 'text-amber-500' :
                      color === 'green' ? 'text-green-500' :
                      color === 'red' ? 'text-destructive' :
                      color === 'primary' ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xl sm:text-2xl font-bold leading-tight ${
                      color === 'amber' ? 'text-amber-500' :
                      color === 'green' ? 'text-green-500' :
                      color === 'red' ? 'text-destructive' :
                      color === 'primary' ? 'text-primary' : 'text-card-foreground'
                    }`}>{value}</p>
                    <p className="text-[11px] text-muted-foreground leading-tight">{label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Users Tabs */}
        <Tabs defaultValue={pendingUsers.length > 0 ? "pending" : "approved"} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 min-h-[44px]">
            <TabsTrigger value="pending" className="text-xs sm:text-sm relative min-h-[40px]">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Pending</span>
              <span className="sm:hidden">Pending</span>
              {pendingUsers.length > 0 && (
                <Badge variant="destructive" className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5 p-0 flex items-center justify-center text-[10px]">
                  {pendingUsers.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved" className="text-xs sm:text-sm min-h-[40px]">
              <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Approved
            </TabsTrigger>
            <TabsTrigger value="banned" className="text-xs sm:text-sm relative min-h-[40px]">
              <Ban className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Banned
              {bannedUsers.length > 0 && (
                <Badge variant="destructive" className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5 p-0 flex items-center justify-center text-[10px]">
                  {bannedUsers.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Pending Users Tab */}
          <TabsContent value="pending">
            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Clock className="w-5 h-5 text-amber-500" />
                  Pending Approval
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Users waiting for admin approval
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                {pendingUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-muted-foreground">No pending approvals</p>
                  </div>
                ) : (
                  <>
                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-3">
                      {pendingUsers.map(user => (
                        <UserCard
                          key={user.id}
                          userItem={user}
                          type="pending"
                          onApprove={handleApproveUser}
                          updatingUserId={updatingUserId}
                          currentUserId={currentUser?.id}
                        />
                      ))}
                    </div>
                    {/* Desktop Table */}
                    <div className="hidden md:block rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>User</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pendingUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-full bg-amber-500/10">
                                    <Clock className="w-4 h-4 text-amber-500" />
                                  </div>
                                  <p className="font-medium">{user.full_name || 'Unnamed User'}</p>
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground">{user.email}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveUser(user.user_id)}
                                  disabled={updatingUserId === user.user_id}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  {updatingUserId === user.user_id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <><UserCheck className="w-4 h-4 mr-1" /> Approve</>
                                  )}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Approved Users Tab */}
          <TabsContent value="approved">
            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-base sm:text-lg">Approved Users</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {approvedUsers.length} user{approvedUsers.length !== 1 ? 's' : ''} with access
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                {approvedUsers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No approved users</p>
                ) : (
                  <>
                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-3">
                      {approvedUsers.map(userItem => (
                        <UserCard
                          key={userItem.id}
                          userItem={userItem}
                          type="approved"
                          onRoleChange={handleRoleChange}
                          onBan={handleBanUser}
                          onDelete={openDeleteDialog}
                          updatingUserId={updatingUserId}
                          currentUserId={currentUser?.id}
                        />
                      ))}
                    </div>
                    {/* Desktop Table */}
                    <div className="hidden md:block rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>User</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {approvedUsers.map((userItem) => (
                            <TableRow key={userItem.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-full ${userItem.role === 'admin' ? 'bg-primary/10' : 'bg-muted'}`}>
                                    {userItem.role === 'admin' ? (
                                      <Shield className="w-4 h-4 text-primary" />
                                    ) : (
                                      <User className="w-4 h-4 text-muted-foreground" />
                                    )}
                                  </div>
                                  <p className="font-medium">{userItem.full_name || 'Unnamed User'}</p>
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground">{userItem.email}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={userItem.role === 'admin' ? 'default' : 'secondary'}
                                  className={userItem.role === 'admin' ? 'bg-primary' : ''}
                                >
                                  {userItem.role === 'admin' ? 'Admin' : 'User'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Select
                                    value={userItem.role}
                                    onValueChange={(value: 'admin' | 'user') => handleRoleChange(userItem.user_id, value)}
                                    disabled={updatingUserId === userItem.user_id || userItem.user_id === currentUser?.id}
                                  >
                                    <SelectTrigger className="w-[100px]">
                                      {updatingUserId === userItem.user_id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <SelectValue />
                                      )}
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="admin">
                                        <span className="flex items-center gap-2"><Shield className="w-3 h-3" /> Admin</span>
                                      </SelectItem>
                                      <SelectItem value="user">
                                        <span className="flex items-center gap-2"><User className="w-3 h-3" /> User</span>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  {userItem.user_id !== currentUser?.id && userItem.role !== 'admin' && (
                                    <Button
                                      size="icon"
                                      variant="outline"
                                      onClick={() => handleBanUser(userItem)}
                                      disabled={updatingUserId === userItem.user_id}
                                      className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                                      title="Ban User"
                                    >
                                      <Ban className="w-4 h-4" />
                                    </Button>
                                  )}
                                  {userItem.user_id !== currentUser?.id && (
                                    <Button
                                      size="icon"
                                      variant="outline"
                                      onClick={() => openDeleteDialog(userItem)}
                                      disabled={updatingUserId === userItem.user_id}
                                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                      title="Delete User"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Banned Users Tab */}
          <TabsContent value="banned">
            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Ban className="w-5 h-5 text-destructive" />
                  Banned Users
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Users who have been banned from the system
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                {bannedUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-muted-foreground">No banned users</p>
                  </div>
                ) : (
                  <>
                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-3">
                      {bannedUsers.map(userItem => (
                        <UserCard
                          key={userItem.id}
                          userItem={userItem}
                          type="banned"
                          onBan={handleBanUser}
                          onDelete={openDeleteDialog}
                          updatingUserId={updatingUserId}
                          currentUserId={currentUser?.id}
                        />
                      ))}
                    </div>
                    {/* Desktop Table */}
                    <div className="hidden md:block rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>User</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bannedUsers.map((userItem) => (
                            <TableRow key={userItem.id} className="bg-destructive/5">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-full bg-destructive/10">
                                    <Ban className="w-4 h-4 text-destructive" />
                                  </div>
                                  <p className="font-medium">{userItem.full_name || 'Unnamed User'}</p>
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground">{userItem.email}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleBanUser(userItem)}
                                    disabled={updatingUserId === userItem.user_id}
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-500/10"
                                  >
                                    {updatingUserId === userItem.user_id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <><ShieldOff className="w-4 h-4 mr-1" /> Unban</>
                                    )}
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() => openDeleteDialog(userItem)}
                                    disabled={updatingUserId === userItem.user_id}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    title="Delete User"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={handleDeleteUser}
        studentName={userToDelete?.full_name || userToDelete?.email || 'this user'}
      />
      
      <Footer />
    </div>
  );
}
