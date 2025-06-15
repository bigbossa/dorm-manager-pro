
export function exportToCsv(filename: string, rows: any[]) {
  if (!Array.isArray(rows) || rows.length === 0) return;

  // Convert object array to CSV string
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(",") +
    "\n" +
    rows.map(row =>
      keys.map(k => 
        {
          const v = row[k];
          if (typeof v === "string" && (v.includes(",") || v.includes('"') || v.includes("\n"))) {
            return '"' + v.replace(/"/g, '""') + '"';
          }
          return v ?? "";
        }
      ).join(",")
    ).join("\n");

  // Create download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}
