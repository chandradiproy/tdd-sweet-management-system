// File Path: frontend/src/pages/UserManagementPage.jsx
import React, { useEffect, useState } from 'react';
import useUserStore from '@/store/userStore';
import useAuthStore from '@/store/authStore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoaderCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';

const UserManagementPage = () => {
  const { user: currentUser } = useAuthStore();
  const { users, isLoading, fetchUsers, updateUserRole } = useUserStore();
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [confirmation, setConfirmation] = useState({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingUserId(userId);
    try {
      await updateUserRole(userId, newRole);
    } catch (error) {
      // Error is handled in the store, but we need to reset the UI here
      // To re-fetch the users to reset the dropdown to its original state on failure
      fetchUsers();
    } finally {
      setUpdatingUserId(null);
    }
  };

  const requestRoleChange = (user, newRole) => {
    // Prevent changing the role if it's the same
    if (user.role === newRole) return;

    let title = 'Confirm Role Change';
    let description = `Are you sure you want to change ${user.name}'s role to ${newRole}?`;

    if (user._id === currentUser._id && newRole === 'customer') {
        title = 'Confirm Self-Demotion';
        description = 'Warning: You are about to change your own role to Customer. You will lose all administrative privileges immediately. Are you sure you want to proceed?';
    }

    setConfirmation({
      isOpen: true,
      title,
      description,
      onConfirm: () => handleRoleChange(user._id, newRole),
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoaderCircle className="h-12 w-12 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <>
      <ConfirmationDialog
        open={confirmation.isOpen}
        onOpenChange={(isOpen) => setConfirmation({ ...confirmation, isOpen })}
        title={confirmation.title}
        description={confirmation.description}
        onConfirm={confirmation.onConfirm}
      />
      <div className="space-y-6">
         <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-800 dark:text-white">User Management</h1>
            <p className="text-gray-500 dark:text-gray-400">Update user roles across the application.</p>
          </div>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Current Role</TableHead>
                <TableHead className="text-right">Change Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {updatingUserId === user._id ? (
                       <LoaderCircle className="h-5 w-5 animate-spin ml-auto" />
                    ) : (
                      <Select
                          value={user.role}
                          onValueChange={(newRole) => requestRoleChange(user, newRole)}
                      >
                          <SelectTrigger className="w-[180px] ml-auto">
                              <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="customer">Customer</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default UserManagementPage;

