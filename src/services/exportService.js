import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportService = {
  // Export Marks Roster to CSV
  exportToCSV(std, subject, students, savedMarks, maxMarks) {
    const headers = ['Roll No', 'Student Name', 'Marks Obtained', 'Max Marks', 'Status'];
    const rows = students.map((st) => {
      const entry = savedMarks[st.id];
      const rawVal = entry ? entry.value : '';
      let status = 'Pending';
      let scoreVal = rawVal;

      if (rawVal === 'A') status = 'Absent';
      else if (rawVal === 'E') status = 'Exempt';
      else if (rawVal !== '') status = 'Present';

      return [
        st.roll ?? '—',
        `"${st.name.replace(/"/g, '""')}"`,
        scoreVal !== '' ? scoreVal : '—',
        maxMarks,
        status
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [
      `"AL JAMEA TUS SAIFIYAH — MAROL CAMPUS"`,
      `"FORMATIVE ASSESSMENT MARKS ROSTER"`,
      `"Class: ${std} | Course: ${subject} | Max Marks: ${maxMarks}"`,
      '',
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Al_Jamea_Class_${std}_${subject}_Marks.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Export Professional Vector PDF Academic Report
  exportToPDF(std, subject, students, savedMarks, maxMarks) {
    const doc = new jsPDF();
    const sorted = [...students].sort((a, b) => (a.roll || 0) - (b.roll || 0));

    let filledCount = 0;
    let totalScore = 0;
    let highestMark = 0;
    let lowestMark = maxMarks;

    const tableRows = sorted.map((st, idx) => {
      const entry = savedMarks[st.id];
      const rawVal = entry ? entry.value : '';
      let displayVal = '—';
      let status = 'Pending';

      if (rawVal === 'A') {
        displayVal = 'A';
        status = 'Absent';
      } else if (rawVal === 'E') {
        displayVal = 'E';
        status = 'Exempt';
      } else if (rawVal !== '') {
        const num = parseFloat(rawVal);
        if (!isNaN(num)) {
          const clamped = Math.min(Math.max(0, num), maxMarks);
          displayVal = String(clamped);
          filledCount++;
          totalScore += clamped;
          if (clamped > highestMark) highestMark = clamped;
          if (clamped < lowestMark) lowestMark = clamped;
          status = 'Graded';
        }
      }

      return [
        st.roll ?? (idx + 1),
        st.name,
        displayVal,
        String(maxMarks),
        status
      ];
    });

    const avgScore = filledCount > 0 ? (totalScore / filledCount).toFixed(1) : '—';
    const completionPct = Math.round((filledCount / sorted.length) * 100);

    // 1. INSTITUTIONAL HEADER
    doc.setFillColor(30, 42, 56); // Deep Navy Ink
    doc.rect(0, 0, 210, 36, 'F');

    doc.setTextColor(230, 206, 140); // Gold Accent
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('AL JAMEA TUS SAIFIYAH — MAROL CAMPUS', 14, 16);

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('FORMATIVE ASSESSMENT ACADEMIC REPORT', 14, 26);

    // 2. METADATA SUMMARY BAR
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Class: Class ${std}`, 14, 46);
    doc.text(`Course: ${subject}`, 70, 46);
    doc.text(`Max Marks: ${maxMarks}`, 135, 46);
    doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 14, 52);

    // 3. STATISTICAL ANALYTICS BOXES
    doc.setFillColor(244, 246, 240);
    doc.roundedRect(14, 58, 182, 18, 2, 2, 'F');

    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(`Enrolled: ${sorted.length} Students`, 20, 69);
    doc.text(`Assessed: ${filledCount}/${sorted.length} (${completionPct}%)`, 70, 69);
    doc.text(`Class Average: ${avgScore}/${maxMarks}`, 125, 69);
    doc.text(`Highest: ${highestMark}`, 170, 69);

    // 4. AUTOTABLE STUDENT ROSTER
    autoTable(doc, {
      startY: 82,
      head: [['Roll #', 'Student Name', 'Score', 'Max', 'Assessment Status']],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 42, 56],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      columnStyles: {
        0: { cellWidth: 20, halign: 'center' },
        1: { cellWidth: 90 },
        2: { cellWidth: 25, halign: 'center', fontStyle: 'bold' },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 27, halign: 'center' }
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      }
    });

    // 5. OFFICIAL INSTITUTIONAL SIGNATURE BLOCK AT FOOTER
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 25 : 220;
    if (finalY < 260) {
      doc.setDrawColor(180, 180, 180);
      doc.line(20, finalY, 80, finalY);
      doc.line(130, finalY, 190, finalY);

      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('Faculty Examiner Signature', 26, finalY + 6);
      doc.text('University Administrator Signature', 132, finalY + 6);
    }

    doc.save(`Al_Jamea_Class_${std}_${subject}_Report.pdf`);
  }
};
