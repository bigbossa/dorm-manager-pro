
import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";

type AuthUser = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  banned_until?: string;
  confirmed_at?: string;
};

const EDGE_FUNCTION_URL = "https://mnsotnlftoumjwjlvzus.functions.supabase.co/manage-auth-users";

export default function AuthUsersPage() {
  const { user, session } = useAuth();
  const { language } = useLanguage();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  // Only allow admin
  if (user?.role !== "admin") {
    return <div className="text-center text-destructive mt-8">Permission denied.</div>;
  }

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const resp = await fetch(
        EDGE_FUNCTION_URL,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uc290bmxmdG91bWp3amx2enVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMTI4NTYsImV4cCI6MjA2MzU4ODg1Nn0.8r2EP-08imfAL2EFVIgfCHu5lMs2ILJYGds8vs5LC98", // anon key
          },
        }
      );
      const data = await resp.json();
      if (resp.ok) {
        setUsers(data.users ?? []);
      } else {
        toast({
          title: "Error",
          description: data?.error || "Failed to fetch users",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  const handleDelete = async () => {
    if (!selected.length) return;
    setDeleting(true);
    try {
      const resp = await fetch(
        EDGE_FUNCTION_URL,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
            apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uc290bmxmdG91bWp3amx2enVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMTI4NTYsImV4cCI6MjA2MzU4ODg1Nn0.8r2EP-08imfAL2EFVIgfCHu5lMs2ILJYGds8vs5LC98",
          },
          body: JSON.stringify({ user_ids: selected }),
        }
      );
      const data = await resp.json();
      if (resp.ok && data?.success) {
        toast({
          title: language === "th" ? "ลบผู้ใช้เรียบร้อย" : "Users deleted",
          description: `${data.deleted.length} deleted, ${data.failed.length} failed`,
          variant: "default",
        });
        setSelected([]);
        fetchUsers();
      } else {
        toast({
          title: "Error",
          description: data?.error || "Failed to delete users",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setDeleting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{language === "th" ? "จัดการ Auth Users" : "Auth User Management"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <div>
            {language === "th"
              ? "รายการผู้ใช้ทั้งหมดในระบบ Supabase Auth"
              : "All users in Supabase Auth"}
          </div>
          <Button variant="destructive" onClick={handleDelete} disabled={!selected.length || deleting}>
            {language === "th"
              ? deleting
                ? "กำลังลบ..."
                : "ลบผู้ใช้ที่เลือก"
              : deleting
                ? "Deleting..."
                : "Delete selected"}
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <input
                    type="checkbox"
                    checked={selected.length === users.length && users.length > 0}
                    onChange={e => setSelected(e.target.checked ? users.map(u => u.id) : [])}
                  />
                </TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Last Sign In</TableHead>
                <TableHead>Banned?</TableHead>
                <TableHead>Confirmed?</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    {language === "th" ? "ไม่พบผู้ใช้" : "No users found"}
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selected.includes(u.id)}
                        onChange={e =>
                          setSelected(e.target.checked
                            ? [...selected, u.id]
                            : selected.filter(id => id !== u.id))}
                      />
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.created_at?.split("T")[0]}</TableCell>
                    <TableCell>{u.last_sign_in_at?.split("T")[0] ?? "-"}</TableCell>
                    <TableCell>{u.banned_until ? "Yes" : ""}</TableCell>
                    <TableCell>{u.confirmed_at ? "Yes" : ""}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
