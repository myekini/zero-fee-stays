import { useState } from "react";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export type UserRole = "user" | "host" | "admin";

interface RoleUpdate {
  userId: string;
  role: UserRole;
}

export function useRoleManagement() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Update a single user's role
   */
  const updateUserRole = async (
    userId: string,
    newRole: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    if (!session?.access_token) {
      return { success: false, error: "Not authenticated" };
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Failed to update role",
          description: data.error || "An error occurred",
          variant: "destructive",
        });
        return { success: false, error: data.error };
      }

      toast({
        title: "Role updated",
        description: `User role changed to ${newRole}`,
        variant: "default",
      });

      return { success: true };
    } catch (error) {
      const errorMessage = "Network error - please try again";
      toast({
        title: "Failed to update role",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get a user's current role
   */
  const getUserRole = async (
    userId: string
  ): Promise<{ role?: UserRole; error?: string }> => {
    if (!session?.access_token) {
      return { error: "Not authenticated" };
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error };
      }

      return { role: data.role };
    } catch (error) {
      return { error: "Network error - please try again" };
    }
  };

  /**
   * Batch update multiple users' roles
   */
  const batchUpdateRoles = async (
    updates: RoleUpdate[]
  ): Promise<{
    success: boolean;
    results?: {
      successful: string[];
      failed: { userId: string; error: string }[];
    };
    error?: string;
  }> => {
    if (!session?.access_token) {
      return { success: false, error: "Not authenticated" };
    }

    if (!updates.length) {
      return { success: false, error: "No updates provided" };
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/roles/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ updates }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Batch update failed",
          description: data.error || "An error occurred",
          variant: "destructive",
        });
        return { success: false, error: data.error };
      }

      const { successful, failed } = data.results;

      if (failed.length > 0) {
        toast({
          title: "Partial success",
          description: `Updated ${successful.length} users, ${failed.length} failed`,
          variant: "default",
        });
      } else {
        toast({
          title: "All roles updated",
          description: `Successfully updated ${successful.length} user roles`,
          variant: "default",
        });
      }

      return { success: true, results: data.results };
    } catch (error) {
      const errorMessage = "Network error - please try again";
      toast({
        title: "Batch update failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Promote user to host
   */
  const promoteToHost = async (userId: string) => {
    return updateUserRole(userId, "host");
  };

  /**
   * Promote user to admin
   */
  const promoteToAdmin = async (userId: string) => {
    return updateUserRole(userId, "admin");
  };

  /**
   * Demote user to regular user
   */
  const demoteToUser = async (userId: string) => {
    return updateUserRole(userId, "user");
  };

  return {
    isLoading,
    updateUserRole,
    getUserRole,
    batchUpdateRoles,
    promoteToHost,
    promoteToAdmin,
    demoteToUser,
  };
}
