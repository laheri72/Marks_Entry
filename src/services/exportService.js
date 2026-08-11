import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportService = {
  // Export Class Marks Roster to Excel / CSV with Guarded Values
  exportToCSV(std, subject, students, marksMap, maxMarks) {
    const rows = students.map((st) => {
      const entry = marksMap[st.id];
      const val = entry ? entry.value : '';
      const numVal = parseFloat(val);
      const isNumeric = !isNaN(numVal) && val !== 'A' && val !== 'E';
      const clampedVal = isNumeric ? Math.min(Math.max(0, numVal), maxMarks) : val;
      const pct = isNumeric && maxMarks ? ((clampedVal / maxMarks) * 100).toFixed(1) + '%' : 'N/A';

      return {
        'Roll Number': st.roll ?? '',
        'Student Name': st.name,
        'Class': std,
        'Subject': subject,
        'Marks Obtained': val !== '' ? clampedVal : 'Not Entered',
        'Max Marks': maxMarks,
        'Percentage': pct,
        'Entered By': entry ? entry.enteredByName : '—',
        'Last Updated': entry ? new Date(entry.at).toLocaleString() : '—'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Marks Register');
    
    // Trigger download
    const cleanFilename = `Class_${std.replace(/[^a-zA-Z0-9]/g, '_')}_${subject}_Marks.xlsx`;
    XLSX.writeFile(workbook, cleanFilename);
  },

  // Export Class Report Card to Vector PDF with School Header Branding
  exportToPDF(std, subject, students, marksMap, maxMarks) {
    const doc = new jsPDF();
    const nowStr = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

    // Document Header
    doc.setFillColor(30, 42, 56); // Navy Ink
    doc.rect(0, 0, 210, 28, 'F');

    doc.setTextColor(238, 243, 232); // Paper
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('THE REGISTER — FORMATIVE ASSESSMENT REPORT', 14, 15);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on ${nowStr} | Official Academic Record`, 14, 22);

    // Meta Block
    doc.setTextColor(30, 42, 56);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Class: Standard ${std}`, 14, 38);
    doc.text(`Subject: ${subject}`, 100, 38);
    doc.text(`Max Marks: ${maxMarks}`, 160, 38);

    // Guarded Statistics Calculation
    let filledCount = 0;
    let totalScore = 0;
    let highestMark = 0;

    students.forEach((st) => {
      const e = marksMap[st.id];
      if (e && e.value !== '' && e.value !== 'A' && e.value !== 'E') {
        const v = parseFloat(e.value);
        if (!isNaN(v)) {
          const clampedVal = Math.min(Math.max(0, v), maxMarks);
          filledCount++;
          totalScore += clampedVal;
          if (clampedVal > highestMark) highestMark = clampedVal;
        }
      }
    });

    const avgScore = filledCount > 0 ? (totalScore / filledCount).toFixed(1) : 'N/A';

    // Summary Box
    doc.setFillColor(244, 248, 240);
    doc.setDrawColor(198, 211, 188);
    doc.roundedRect(14, 43, 182, 14, 3, 3, 'FD');

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(85, 99, 111);
    doc.text(`Total Students: ${students.length}   |   Marks Entered: ${filledCount} / ${students.length}   |   Class Avg: ${avgScore} / ${maxMarks}   |   Highest: ${highestMark} / ${maxMarks}`, 18, 52);

    // Table Columns & Rows
    const tableHeaders = [['Roll #', 'Student Name', 'Marks Obtained', 'Percentage', 'Status', 'Entered By']];
    const tableData = students.map((st) => {
      const e = marksMap[st.id];
      const val = e ? e.value : '—';
      const numVal = parseFloat(val);
      const isNumeric = !isNaN(numVal) && val !== 'A' && val !== 'E';
      const clampedVal = isNumeric ? Math.min(Math.max(0, numVal), maxMarks) : val;
      const pct = isNumeric && maxMarks ? ((clampedVal / maxMarks) * 100).toFixed(1) + '%' : '—';
      const status = e && e.value !== '' ? 'Submitted' : 'Pending';

      return [
        st.roll ?? '—',
        st.name,
        val !== '—' ? `${clampedVal} / ${maxMarks}` : '—',
        pct,
        status,
        e ? e.enteredByName : '—'
      ];
    });

    // Auto Table Generation
    autoTable(doc, {
      startY: 62,
      head: tableHeaders,
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 42, 56],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9.5,
        textColor: [30, 42, 56]
      },
      alternateRowStyles: {
        fillColor: [248, 250, 246]
      },
      columnStyles: {
        0: { cellWidth: 20, fontStyle: 'bold' },
        1: { cellWidth: 70 },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 22, halign: 'center' },
        5: { cellWidth: 33 }
      }
    });

    // Footer Signatures
    const finalY = doc.lastAutoTable.finalY + 25;
    if (finalY < 270) {
      doc.setDrawColor(180, 180, 180);
      doc.line(14, finalY, 64, finalY);
      doc.line(146, finalY, 196, finalY);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Subject Teacher Signature', 14, finalY + 5);
      doc.text('Academic Coordinator / Admin', 146, finalY + 5);
    }

    // Trigger PDF output preview in new window or download
    doc.save(`Class_${std.replace(/[^a-zA-Z0-9]/g, '_')}_${subject}_Report.pdf`);
  }
};
