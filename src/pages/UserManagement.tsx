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
import { ArrowLeft, Shield, User, Users, Loader2, CheckCircle, Clock, UserCheck, Ban, Trash2, ShieldOff } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { logUserBan, logUserDelete } from '@/utils/logger';

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
      
      // Fetch profiles with their roles including is_approved and is_banned
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, email, full_name, is_approved, is_banned, created_at');

      if (profilesError) throw profilesError;

      // Fetch all roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine profiles with roles
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
      
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      setUsers(prev => 
        prev.map(u => u.user_id === userId ? { ...u, role: newRole } : u)
      );
      
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
      
      const { error } = await supabase
        .from('profiles')
        .update({ is_approved: true })
        .eq('user_id', userId);

      if (error) throw error;

      setUsers(prev => 
        prev.map(u => u.user_id === userId ? { ...u, is_approved: true } : u)
      );
      
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
      
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: newBannedStatus })
        .eq('user_id', userItem.user_id);

      if (error) throw error;

      setUsers(prev => 
        prev.map(u => u.user_id === userItem.user_id ? { ...u, is_banned: newBannedStatus } : u)
      );
      
      // Log the action
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
      
      // Get session for auth header
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Authentication required');
        return;
      }

      // Call edge function to delete user
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

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete user');
      }

      // Log the action
      await logUserDelete(userToDelete.user_id, userToDelete.email || 'Unknown');
      
      // Remove user from local state
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
      
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">User Management</h1>
              <p className="text-muted-foreground">Manage user roles and permissions</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          <Card className="border-amber-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-amber-500">{pendingUsers.length}</p>
            </CardContent>
          </Card>
          <Card className="border-green-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-500">{approvedUsers.length}</p>
            </CardContent>
          </Card>
          <Card className="border-destructive/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Ban className="w-4 h-4 text-destructive" />
                Banned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-destructive">{bannedUsers.length}</p>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Admins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{adminCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <User className="w-4 h-4" />
                Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{userCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Users Tabs */}
        <Tabs defaultValue={pendingUsers.length > 0 ? "pending" : "approved"} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="relative">
              <Clock className="w-4 h-4 mr-2" />
              Pending
              {pendingUsers.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {pendingUsers.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">
              <CheckCircle className="w-4 h-4 mr-2" />
              Approved
            </TabsTrigger>
            <TabsTrigger value="banned" className="relative">
              <Ban className="w-4 h-4 mr-2" />
              Banned
              {bannedUsers.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {bannedUsers.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Pending Users Tab */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  Pending Approval
                </CardTitle>
                <CardDescription>
                  Users waiting for admin approval to access the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : pendingUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-muted-foreground">No pending approvals</p>
                  </div>
                ) : (
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>User</TableHead>
                          <TableHead className="hidden sm:table-cell">Email</TableHead>
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
                                <div>
                                  <p className="font-medium">{user.full_name || 'Unnamed User'}</p>
                                  <p className="text-xs text-muted-foreground sm:hidden">{user.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-muted-foreground">
                              {user.email}
                            </TableCell>
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
                                  <>
                                    <UserCheck className="w-4 h-4 mr-1" />
                                    Approve
                                  </>
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Approved Users Tab */}
          <TabsContent value="approved">
            <Card>
              <CardHeader>
                <CardTitle>Approved Users</CardTitle>
                <CardDescription>
                  {approvedUsers.length} user{approvedUsers.length !== 1 ? 's' : ''} with access
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : approvedUsers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No approved users</p>
                ) : (
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>User</TableHead>
                          <TableHead className="hidden sm:table-cell">Email</TableHead>
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
                                <div>
                                  <p className="font-medium">{userItem.full_name || 'Unnamed User'}</p>
                                  <p className="text-xs text-muted-foreground sm:hidden">{userItem.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-muted-foreground">
                              {userItem.email}
                            </TableCell>
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
                                      <span className="flex items-center gap-2">
                                        <Shield className="w-3 h-3" /> Admin
                                      </span>
                                    </SelectItem>
                                    <SelectItem value="user">
                                      <span className="flex items-center gap-2">
                                        <User className="w-3 h-3" /> User
                                      </span>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                {/* Ban button - don't show for current user or other admins */}
                                {userItem.user_id !== currentUser?.id && userItem.role !== 'admin' && (
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() => handleBanUser(userItem)}
                                    disabled={updatingUserId === userItem.user_id}
                                    className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                    title="Ban User"
                                  >
                                    <Ban className="w-4 h-4" />
                                  </Button>
                                )}
                                {/* Delete button - don't show for current user */}
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
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Banned Users Tab */}
          <TabsContent value="banned">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ban className="w-5 h-5 text-destructive" />
                  Banned Users
                </CardTitle>
                <CardDescription>
                  Users who have been banned from the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : bannedUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-muted-foreground">No banned users</p>
                  </div>
                ) : (
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>User</TableHead>
                          <TableHead className="hidden sm:table-cell">Email</TableHead>
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
                                <div>
                                  <p className="font-medium">{userItem.full_name || 'Unnamed User'}</p>
                                  <p className="text-xs text-muted-foreground sm:hidden">{userItem.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-muted-foreground">
                              {userItem.email}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleBanUser(userItem)}
                                  disabled={updatingUserId === userItem.user_id}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                >
                                  {updatingUserId === userItem.user_id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <>
                                      <ShieldOff className="w-4 h-4 mr-1" />
                                      Unban
                                    </>
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
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Delete Confirmation Dialog */}
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
