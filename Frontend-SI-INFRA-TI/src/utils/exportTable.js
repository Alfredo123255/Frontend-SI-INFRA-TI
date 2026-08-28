function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeCsvValue(value) {
  const str = String(value ?? "");
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export function exportRecordsToCsv(records, filename) {
  if (records.length === 0) return;
  const headers = Object.keys(records[0]);
  const lines = [
    headers.map(escapeCsvValue).join(","),
    ...records.map((record) => headers.map((header) => escapeCsvValue(record[header])).join(",")),
  ];
  const BOM = String.fromCharCode(0xfeff);
  const csvContent = BOM + lines.join("\r\n");
  downloadBlob(new Blob([csvContent], { type: "text/csv;charset=utf-8;" }), filename);
}

export async function exportRecordsToExcel(records, filename, sheetName = "Datos") {
  if (records.length === 0) return;
  const XLSX = await import("xlsx");
  const worksheet = XLSX.utils.json_to_sheet(records);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
}
