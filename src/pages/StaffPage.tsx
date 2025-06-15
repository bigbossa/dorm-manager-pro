
import { useState, useEffect } from "react";
import { useLanguage } from "@/providers/LanguageProvider";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// ดึงข้อมูล staff จาก Supabase
const fetchStaff = async () => {
  const { data, error } = await supabase
    .from("staff")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching staff:", error);
    return [];
  }
  return data || [];
};

const StaffPage = () => {
  const { t } = useLanguage();
  const [staffList, setStaffList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchStaff().then((list) => {
      setStaffList(list);
      setLoading(false);
    });
  }, []);

  const filteredStaff = staffList.filter(staff =>
    (staff.first_name + " " + staff.last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (staff.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (staff.phone || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (staff.room_number || "").toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t("Staff") || "Staff"}</h1>
          <p className="text-muted-foreground">{t("Manage your dormitory staff members") || "Manage your dormitory staff members"}</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button className="flex items-center gap-2">
            <UserCircle size={16} />
            {t("Add New Staff") || "Add New Staff"}
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t("Staff Search") || "Staff Search"}</CardTitle>
          <CardDescription>
            {t("Search for staff by name, email, role or department") || "Search for staff by name, email, role, or department"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input 
            placeholder={t("Search staff...") || "Search staff..."} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("Staff List") || "Staff List"}</CardTitle>
          <CardDescription>
            {t("Showing")} {filteredStaff.length} {t("of")} {staffList.length} {t("staff members") || "staff members"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <span className="text-muted-foreground">{t("Loading...") || "Loading..."}</span>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("Name") || "Name"}</TableHead>
                    <TableHead>{t("Email") || "Email"}</TableHead>
                    <TableHead>{t("Phone") || "Phone"}</TableHead>
                    <TableHead>{t("Room") || "Room"}</TableHead>
                    <TableHead>{t("Created At") || "Created At"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage 
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.first_name || ""}${staff.last_name || ""}`} 
                              alt={staff.first_name + " " + staff.last_name} 
                            />
                            <AvatarFallback>
                              {staff.first_name?.[0]}
                              {staff.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{staff.first_name} {staff.last_name}</p>
                            {staff.email && <p className="text-sm text-muted-foreground">{staff.email}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{staff.email || "-"}</TableCell>
                      <TableCell>{staff.phone || "-"}</TableCell>
                      <TableCell>{staff.room_number}</TableCell>
                      <TableCell>
                        {staff.created_at ? new Date(staff.created_at).toLocaleDateString() : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!filteredStaff.length && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        {t("No staff found") || "No staff found"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffPage;
