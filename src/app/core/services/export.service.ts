import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Injectable({ providedIn: 'root' })
export class ExportService {

  exportPDF(fileName: string, headers: string[], rows: any[]) {
    const doc = new jsPDF('p', 'mm', 'a4');
    doc.text(fileName, 14, 10);

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 14,
      theme: 'grid'
    });

    doc.save(`${fileName}.pdf`);
  }

  exportExcel(fileName: string, headers: string[], rows: any[]) {
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
    const xls = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([xls]), `${fileName}.xlsx`);
  }
}
