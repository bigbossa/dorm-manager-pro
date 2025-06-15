import { useState } from "react";
import { useLanguage } from "@/providers/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { ReportSelector } from "@/components/reports/ReportSelector";
import { OccupancyChart } from "@/components/reports/charts/OccupancyChart";
import { RevenueChart } from "@/components/reports/charts/RevenueChart";
import { PieCharts } from "@/components/reports/charts/PieCharts";
import { EventsChart } from "@/components/reports/charts/EventsChart";
import { exportToCsv } from "@/components/reports/utils/exportCsv";
import { useReportsData } from "@/components/reports/hooks/useReportsData";

const ReportsPage = () => {
  const { t } = useLanguage();
  const [selectedReport, setSelectedReport] = useState("occupancy");
  const [timeFrame, setTimeFrame] = useState("year");
  // นำ hook data เข้ามาสำหรับ export ทุกประเภท
  const {
    occupancyData,
    revenueData,
    roomTypeDistribution,
    repairTypeDistribution,
    eventAttendanceData,
  } = useReportsData(selectedReport);

  const handleExport = () => {
    const nowStr = new Date().toISOString().slice(0, 10);
    let filename = `${selectedReport}-report-${nowStr}.csv`;
    let data: any[] = [];
    switch(selectedReport) {
      case "occupancy":
        data = occupancyData || [];
        break;
      case "revenue":
        data = revenueData || [];
        break;
      case "rooms":
        data = roomTypeDistribution?.map(d => ({
          "Room Type": d.name,
          Count: d.value
        })) || [];
        break;
      case "repairs":
        data = repairTypeDistribution?.map(d => ({
          Status: d.name,
          Count: d.value
        })) || [];
        break;
      case "events":
        data = eventAttendanceData || [];
        break;
      default:
        data = [];
    }
    if (data.length === 0) {
      window.alert("No data to export.");
      return;
    }
    exportToCsv(filename, data);
  };

  const renderReport = () => {
    switch(selectedReport) {
      case "occupancy":
        return <OccupancyChart />;
      case "revenue":
        return <RevenueChart />;
      case "rooms":
      case "repairs":
        return <PieCharts selectedReport={selectedReport} />;
      case "events":
        return <EventsChart />;
      default:
        return null;
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground">View and analyze dormitory data</p>
        </div>
        <div className="mt-4 md:mt-0 space-x-2">
          <Button variant="outline" className="flex items-center gap-2" onClick={handleExport}>
            <Download size={16} />
            Export
          </Button>
        </div>
      </div>

      <ReportSelector
        selectedReport={selectedReport}
        setSelectedReport={setSelectedReport}
        timeFrame={timeFrame}
        setTimeFrame={setTimeFrame}
      />

      {renderReport()}
    </div>
  );
};

export default ReportsPage;
