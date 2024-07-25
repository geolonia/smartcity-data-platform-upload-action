import XLSX from 'xlsx';

export default async function excel2csv(excelPath: string) {
  const workbook = XLSX.readFile(excelPath, {cellNF: true, cellText: true, cellDates: true});
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const csv = XLSX.utils.sheet_to_csv(sheet, { FS: ',', RS: '\r\n', blankrows: false, forceQuotes: true});

  return csv.endsWith("\r\n") || csv.endsWith("\n") ? csv : csv + "\r\n";
};
