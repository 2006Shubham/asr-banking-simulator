/**
 * ASR Bank - Universal CSV / Excel Export Utility
 * Adds UTF-8 Byte Order Mark (BOM) so Microsoft Excel opens it directly
 * with proper column delimiters and special characters without encoding errors.
 */

export const exportToCsv = (filename, headers, rows) => {
  if (!rows || !rows.length) {
    alert("No data available to export.");
    return;
  }

  const escapeCell = (cell) => {
    if (cell === null || cell === undefined) return '""';
    const str = String(cell).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerLine = headers.map(escapeCell).join(",");
  const rowLines = rows.map((row) => row.map(escapeCell).join(","));
  const csvContent = "\uFEFF" + [headerLine, ...rowLines].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const sanitizedFilename = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  link.setAttribute("href", url);
  link.setAttribute("download", sanitizedFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportMultipleSectionsToCsv = (filename, sections) => {
  // sections: [ { title: "Section 1", headers: [...], rows: [[...]] } ]
  const escapeCell = (cell) => {
    if (cell === null || cell === undefined) return '""';
    const str = String(cell).replace(/"/g, '""');
    return `"${str}"`;
  };

  const lines = [];

  sections.forEach((sec, idx) => {
    if (sec.title) {
      lines.push(`"${sec.title.toUpperCase()}"`);
    }
    if (sec.headers && sec.headers.length) {
      lines.push(sec.headers.map(escapeCell).join(","));
    }
    if (sec.rows && sec.rows.length) {
      sec.rows.forEach((row) => {
        lines.push(row.map(escapeCell).join(","));
      });
    }
    lines.push(""); // empty spacing line between sections in Excel
  });

  const csvContent = "\uFEFF" + lines.join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const sanitizedFilename = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  link.setAttribute("href", url);
  link.setAttribute("download", sanitizedFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

