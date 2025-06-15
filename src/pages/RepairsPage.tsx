
import { useState } from "react";
import { useLanguage } from "@/providers/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Plus, Wrench } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

type RepairRequest = {
  id: number;
  roomNumber: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  dateReported: Date;
  reportedBy: string;
};

export default function RepairsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [repairs, setRepairs] = useState<RepairRequest[]>([
    {
      id: 1,
      roomNumber: "101",
      description: "Leaking faucet in the bathroom",
      status: "pending",
      dateReported: new Date(2025, 4, 12),
      reportedBy: "John Doe",
    },
    {
      id: 2,
      roomNumber: "202",
      description: "Air conditioner not working",
      status: "in_progress",
      dateReported: new Date(2025, 4, 10),
      reportedBy: "Jane Smith",
    },
    {
      id: 3,
      roomNumber: "305",
      description: "Broken door lock",
      status: "completed",
      dateReported: new Date(2025, 4, 5),
      reportedBy: "David Johnson",
    },
  ]);
  const [newRepair, setNewRepair] = useState<Omit<RepairRequest, "id" | "dateReported">>({
    roomNumber: "",
    description: "",
    status: "pending",
    reportedBy: user?.name || "",
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const handleAddRepair = () => {
    const newId = Math.max(...repairs.map((repair) => repair.id), 0) + 1;
    setRepairs([
      ...repairs,
      {
        ...newRepair,
        id: newId,
        dateReported: new Date(),
      },
    ]);
    setDialogOpen(false);
    toast({
      title: "Repair Request Added",
      description: `Your repair request for room ${newRepair.roomNumber} has been submitted.`,
    });
    setNewRepair({
      roomNumber: "",
      description: "",
      status: "pending",
      reportedBy: user?.name || "",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const handleChangeRepairStatus = (id: number, status: RepairRequest["status"]) => {
    setRepairs(
      repairs.map((repair) => (repair.id === id ? { ...repair, status } : repair))
    );
    toast({
      title: "Repair Status Updated",
      description: `Repair status has been updated to ${status.replace("_", " ")}.`,
    });
  };

  const filteredRepairs = repairs.filter((repair) => {
    const matchesSearch =
      repair.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter
      ? repair.status === statusFilter
      : true;
    
    // For tenants, only show repairs for their own room
    if (user?.role === "tenant" && user?.tenant?.room_number) {
      return (
        matchesSearch &&
        matchesStatus &&
        repair.roomNumber === user.tenant.room_number
      );
    }
    // สำหรับ admin/staff: เหมือนเดิม
    return matchesSearch && matchesStatus;
  });

  const formatDate = (date: Date) => {
    return format(date, "PPP");
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("repairs.management")}</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> {t("repairs.add")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("repairs.add")}</DialogTitle>
              <DialogDescription>
                Submit a new repair request.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="roomNumber">{t("repairs.room")}</label>
                <Input
                  id="roomNumber"
                  value={newRepair.roomNumber}
                  onChange={(e) =>
                    setNewRepair({ ...newRepair, roomNumber: e.target.value })
                  }
                  placeholder="101"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="description">{t("repairs.description")}</label>
                <Textarea
                  id="description"
                  value={newRepair.description}
                  onChange={(e) =>
                    setNewRepair({ ...newRepair, description: e.target.value })
                  }
                  placeholder="Describe the issue..."
                  rows={4}
                />
              </div>
              {(user?.role === "admin" || user?.role === "staff") && (
                <div className="space-y-2">
                  <label htmlFor="status">{t("repairs.status")}</label>
                  <Select
                    value={newRepair.status}
                    onValueChange={(value: any) =>
                      setNewRepair({ ...newRepair, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={handleAddRepair}>{t("repairs.add")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by room or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Repairs Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("repairs.room")}</TableHead>
              <TableHead>{t("repairs.description")}</TableHead>
              <TableHead>{t("repairs.status")}</TableHead>
              <TableHead>{t("repairs.date")}</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRepairs.length > 0 ? (
              filteredRepairs.map((repair) => (
                <TableRow key={repair.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Wrench className="h-4 w-4 mr-2 text-muted-foreground" />
                      {repair.roomNumber}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">{repair.description}</div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        repair.status
                      )}`}
                    >
                      {getStatusLabel(repair.status)}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(repair.dateReported)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            // View details
                            toast({
                              title: "View Details",
                              description: `Viewing details for repair in room ${repair.roomNumber}`,
                            });
                          }}
                        >
                          View Details
                        </DropdownMenuItem>
                        {(user?.role === "admin" || user?.role === "staff") && (
                          <>
                            <DropdownMenuItem
                              onClick={() => {
                                // Edit repair
                                toast({
                                  title: "Edit Repair",
                                  description: `Editing repair for room ${repair.roomNumber}`,
                                });
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() =>
                                handleChangeRepairStatus(repair.id, "pending")
                              }
                            >
                              Set as Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleChangeRepairStatus(repair.id, "in_progress")
                              }
                            >
                              Set as In Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleChangeRepairStatus(repair.id, "completed")
                              }
                            >
                              Set as Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleChangeRepairStatus(repair.id, "cancelled")
                              }
                            >
                              Set as Cancelled
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No repair requests found. Try adjusting your search or filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
