import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
export function parseExcelBuffer(buffer) {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, {
        defval: "",
        raw: false,
    });
    const headers = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
    return {
        headers,
        rows: jsonData,
        totalRows: jsonData.length,
    };
}
export async function generateTemplateExcel(columns, sheetName) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(sheetName);
    sheet.columns = columns.map((col) => ({
        header: col.required ? `${col.header} *` : col.header,
        key: col.header,
        width: col.header.length + 10,
    }));
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4472C4" },
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
}
