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
import { Button } from "@/components/ui/button";
import BillingStatusBadge from "@/components/billing/BillingStatusBadge";

interface BillingRecord {
  id: string;
  billing_month: string;
  room_rent: number;
  water_units: number;
  water_cost: number;
  electricity_units: number;
  electricity_cost: number;
  total_amount: number;
  status: string;
  due_date: string;
  paid_date: string | null;
  created_at: string;
  rooms: {
    room_number: string;
  };
  tenants: {
    first_name: string;
    last_name: string;
  };
}

interface BillingTableProps {
  billings: BillingRecord[];
  filteredBillings: BillingRecord[];
  onMarkAsPaid: (billingId: string) => void;
  onViewDetails: (billing: BillingRecord) => void;
  enablePrint?: boolean;
}

export default function BillingTable({ 
  billings, 
  filteredBillings, 
  onMarkAsPaid,
  onViewDetails,
  enablePrint
}: BillingTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH');
  };

  const formatMonth = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const handlePrint = (billing: BillingRecord) => {
    // เปิดหน้าต่างใหม่พร้อมรายละเอียดบิล สำหรับปริ้น
    const details = `
      <html>
        <head>
          <title>พิมพ์บิล - ${billing.rooms.room_number}</title>
          <style>
            body { font-family: sans-serif; padding: 16px; }
            h2 { text-align: center; }
            table { width: 100%; margin-top: 24px; border-collapse: collapse; }
            td, th { border: 1px solid #777; padding: 8px; text-align: left; }
            .total { font-weight: bold; color: #0d9488; }
          </style>
        </head>
        <body>
          <h2>ใบแจ้งค่าใช้จ่ายหอพัก</h2>
          <table>
            <tr>
              <td>เดือน</td>
              <td>${formatMonth(billing.billing_month)}</td>
            </tr>
            <tr>
              <td>ชื่อผู้เช่า</td>
              <td>${billing.tenants.first_name} ${billing.tenants.last_name}</td>
            </tr>
            <tr>
              <td>ห้อง</td>
              <td>${billing.rooms.room_number}</td>
            </tr>
            <tr>
              <td>ค่าห้อง</td>
              <td>${formatCurrency(billing.room_rent)}</td>
            </tr>
            <tr>
              <td>ค่าน้ำ (${billing.water_units} คน)</td>
              <td>${formatCurrency(billing.water_cost)}</td>
            </tr>
            <tr>
              <td>ค่าไฟ (${billing.electricity_units} หน่วย)</td>
              <td>${formatCurrency(billing.electricity_cost)}</td>
            </tr>
            <tr>
              <td>รวมทั้งสิ้น</td>
              <td class="total">${formatCurrency(billing.total_amount)}</td>
            </tr>
            <tr>
              <td>ครบกำหนด</td>
              <td>${formatDate(billing.due_date)}</td>
            </tr>
            <tr>
              <td>สถานะ</td>
              <td>${billing.status}</td>
            </tr>
            <tr>
              <td>วันที่ชำระ</td>
              <td>${billing.paid_date ? formatDate(billing.paid_date) : 'ยังไม่ได้ชำระ'}</td>
            </tr>
            <tr>
              <td>วันที่สร้างบิล</td>
              <td>${formatDate(billing.created_at)}</td>
            </tr>
          </table>
          <hr style="margin:32px 0;" />
          <div style="text-align:center;color:#888;font-size:12px;">ขอบคุณที่ใช้บริการหอพักของเรา</div>
          <script>window.onload = () => { window.print(); setTimeout(()=>window.close(), 1000) }</script>
        </body>
      </html>
    `;
    const printWindow = window.open('', '_blank', 'width=720,height=900');
    if (printWindow) {
      printWindow.document.write(details);
      printWindow.document.close();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>รายการบิล</CardTitle>
        <CardDescription>
          แสดง {filteredBillings.length} จาก {billings.length} รายการ
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>เดือน</TableHead>
                <TableHead>ผู้เช่า</TableHead>
                <TableHead>ห้อง</TableHead>
                <TableHead>ค่าห้อง</TableHead>
                <TableHead>ค่าน้ำ</TableHead>
                <TableHead>ค่าไฟ</TableHead>
                <TableHead>รวม</TableHead>
                <TableHead>ครบกำหนด</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right">การดำเนินการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBillings.length > 0 ? (
                filteredBillings.map((billing) => (
                  <TableRow key={billing.id}>
                    <TableCell className="font-medium">
                      {formatMonth(billing.billing_month)}
                    </TableCell>
                    <TableCell>
                      {billing.tenants.first_name} {billing.tenants.last_name}
                    </TableCell>
                    <TableCell>{billing.rooms.room_number}</TableCell>
                    <TableCell>{formatCurrency(billing.room_rent)}</TableCell>
                    <TableCell>
                      {formatCurrency(billing.water_cost)}
                      <div className="text-xs text-muted-foreground">
                        {billing.water_units} คน
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(billing.electricity_cost)}
                      <div className="text-xs text-muted-foreground">
                        {billing.electricity_units} หน่วย
                      </div>
                    </TableCell>
                    <TableCell className="font-bold">
                      {formatCurrency(billing.total_amount)}
                    </TableCell>
                    <TableCell>{formatDate(billing.due_date)}</TableCell>
                    <TableCell>
                      <BillingStatusBadge status={billing.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="space-x-2">
                        {enablePrint && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePrint(billing)}
                          >
                            ปริ้นบิล
                          </Button>
                        )}
                        {billing.status === 'pending' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onMarkAsPaid(billing.id)}
                          >
                            ชำระแล้ว
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onViewDetails(billing)}
                        >
                          ดูรายละเอียด
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-4">
                    ไม่พบข้อมูลบิลที่ตรงกับเงื่อนไขการค้นหา
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
