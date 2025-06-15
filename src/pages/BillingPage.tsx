import BillingCalculationDialog from "@/components/billing/BillingCalculationDialog";
import BillingHeader from "@/components/billing/components/BillingHeader";
import BillingFilters from "@/components/billing/components/BillingFilters";
import BillingTable from "@/components/billing/components/BillingTable";
import BillingDetailDialog from "@/components/billing/components/BillingDetailDialog";
import { useBillingPage } from "@/components/billing/hooks/useBillingPage";
import { useBillingDetail } from "@/components/billing/hooks/useBillingDetail";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { exportToCsv } from "@/components/reports/utils/exportCsv";
import { useState } from "react";

const BillingPage = () => {
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    billings,
    filteredBillings,
    loading,
    showCalculationDialog,
    setShowCalculationDialog,
    fetchBillings,
    handleMarkAsPaid
  } = useBillingPage();

  const {
    selectedBilling,
    isDetailDialogOpen,
    openDetailDialog,
    closeDetailDialog,
    setIsDetailDialogOpen
  } = useBillingDetail();

  // Export CSV handler
  const handleExport = () => {
    if (billings.length === 0) {
      window.alert("ไม่มีข้อมูลสำหรับส่งออก");
      return;
    }
    const dataForExport = billings.map(billing => ({
      "เดือน": new Date(billing.billing_month).toLocaleDateString('th-TH', { year: "numeric", month: "long" }),
      "ชื่อผู้เช่า": billing.tenants.first_name + " " + billing.tenants.last_name,
      "ห้อง": billing.rooms.room_number,
      "ค่าห้อง": billing.room_rent,
      "ค่าน้ำ": billing.water_cost,
      "หน่วยน้ำ": billing.water_units,
      "ค่าไฟ": billing.electricity_cost,
      "หน่วยไฟ": billing.electricity_units,
      "รวม": billing.total_amount,
      "ครบกำหนด": new Date(billing.due_date).toLocaleDateString('th-TH'),
      "สถานะ": billing.status,
      "วันที่ชำระ": billing.paid_date ? new Date(billing.paid_date).toLocaleDateString('th-TH') : "",
      "วันที่สร้างบิล": new Date(billing.created_at).toLocaleDateString('th-TH')
    }));
    const nowStr = new Date().toISOString().slice(0, 10);
    exportToCsv(`billing-all-${nowStr}.csv`, dataForExport);
  };

  if (loading) {
    return (
      <div className="animate-in fade-in duration-500">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center mb-2 gap-2 justify-between">
        <BillingHeader onOpenCalculationDialog={() => setShowCalculationDialog(true)} />
        <Button variant="outline" className="flex items-center gap-2" onClick={handleExport}>
          <FileSpreadsheet size={16} />
          ส่งออกเป็น CSV
        </Button>
      </div>

      <BillingFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <BillingTable
        billings={billings}
        filteredBillings={filteredBillings}
        onMarkAsPaid={handleMarkAsPaid}
        onViewDetails={openDetailDialog}
        enablePrint // <-- ส่ง prop เพื่อเปิดปุ่ม print
      />

      <BillingCalculationDialog
        open={showCalculationDialog}
        onOpenChange={setShowCalculationDialog}
        onBillingCreated={fetchBillings}
      />

      <BillingDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        billing={selectedBilling}
      />
    </div>
  );
};

export default BillingPage;
