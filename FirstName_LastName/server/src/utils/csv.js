// Escapes a value for CSV and neutralises spreadsheet formula injection.
function csvCell(value) {
  if (value === null || value === undefined) return '';
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  if (/[",\n\r]/.test(text)) text = `"${text.replace(/"/g, '""')}"`;
  return text;
}

const csvRow = (values) => values.map(csvCell).join(',');

module.exports = { csvRow };
