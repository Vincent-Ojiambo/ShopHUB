import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield, ShieldOff } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;

interface UserWithRole extends Profile {
  adminRole?: 'admin' | 'moderator' | 'user' | null;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: 'Failed to load users', variant: 'destructive' });
      setLoading(false);
      return;
    }

    // Fetch roles for all users
    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id, role');

    const usersWithRoles: UserWithRole[] = (profiles || []).map(profile => ({
      ...profile,
      adminRole: roles?.find(r => r.user_id === profile.id)?.role as UserWithRole['adminRole'] || null,
    }));

    setUsers(usersWithRoles);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUserRole = async (userId: string, newRole: string) => {
    if (newRole === 'none') {
      // Remove role
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (error) {
        toast({ title: 'Error', description: 'Failed to update role', variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Role removed' });
        fetchUsers();
      }
    } else {
      // Upsert role
      const { error } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role: newRole as 'admin' | 'moderator' | 'user' }, { onConflict: 'user_id,role' });

      if (error) {
        // Try delete then insert if upsert fails
        await supabase.from('user_roles').delete().eq('user_id', userId);
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: newRole as 'admin' | 'moderator' | 'user' });

        if (insertError) {
          toast({ title: 'Error', description: 'Failed to update role', variant: 'destructive' });
          return;
        }
      }
      toast({ title: 'Success', description: 'Role updated' });
      fetchUsers();
    }
  };

  const getRoleBadge = (role: string | null) => {
    switch (role) {
      case 'admin':
        return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full"><Shield className="h-3 w-3" /> Admin</span>;
      case 'moderator':
        return <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">Moderator</span>;
      case 'user':
        return <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">User</span>;
      default:
        return <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">No role</span>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground">Manage user accounts and roles</p>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">No users found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <span className="text-sm font-medium">
                                {user.full_name?.charAt(0) || '?'}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{user.full_name || 'Unnamed'}</p>
                            <p className="text-xs text-muted-foreground">{user.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.phone || '-'}</TableCell>
                      <TableCell>
                        {user.city && user.country ? `${user.city}, ${user.country}` : '-'}
                      </TableCell>
                      <TableCell>{getRoleBadge(user.adminRole || null)}</TableCell>
                      <TableCell>{new Date(user.created_at || '').toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Select
                          value={user.adminRole || 'none'}
                          onValueChange={(value) => updateUserRole(user.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Set role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No role</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
